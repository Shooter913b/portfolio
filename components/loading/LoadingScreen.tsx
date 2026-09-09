"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PaperPlaneSvg } from "@/components/ui/PaperPlaneSvg";

/**
 * Full-screen intro: a paper plane flies in from the left and sweeps off to the
 * right, "dragging" the curtain away to reveal the page. Plays on every load
 * and on every route change.
 *
 * Two flights. The full version, with a loop at the centre, is an arrival
 * flourish: it plays on a fresh load of the home page and on the first page of
 * a session, so a shared deep link still gets the whole show. In-app
 * navigation gets a quick wave that enters high on the left and settles at mid
 * height on the right.
 *
 * The flight is one continuous path with matching (+x) tangents at every join
 * and a single eased arc-length mapping, so speed/direction never jump.
 *
 * The path is sampled once into a fixed-step arc-length lookup table, so the
 * frame loop never touches SVG geometry APIs and the trail is painted through
 * every sampled point it crossed — a slow frame costs time, never shape.
 */

const PLANE_W = 40;
const PLANE_H = 29;
// The SVG nose natively points up-right (~ -32deg); offset so it leads travel.
const PLANE_NOSE_OFFSET = 32;
// Global tempo. Every authored duration below is stated at its original value
// and scaled by this, so the whole intro keeps its rhythm while running faster.
const TEMPO = 0.7;
// Full flight: swoop in, loop, sweep out. Shown on the home page and on a
// visitor's first page of the session.
const LOOP_FLIGHT_MS = 2560 * TEMPO;
// Straight pass: a wavy left-to-right dash, no loop. Deliberately much
// shorter — it is a page transition, not an intro.
const STRAIGHT_FLIGHT_MS = 1150 * TEMPO;
// Shape of that pass: enters at this fraction of the viewport height (upper
// half), waves this many times, and tapers to mid height by the right edge.
const WAVE_START_RATIO = 0.3;
// Keep this a whole number: the sine is then zero at both ends, so the flight
// lands exactly on mid height no matter how the amplitude is tapered.
const WAVE_CYCLES = 2;
const WAVE_AMP_RATIO = 0.055;
// Target Bezier sub-span length. Cubic Hermite at this density tracks the sine
// to well under a pixel, and the path lookup table resamples it anyway.
const WAVE_SEGMENT_PX = 90;
// Cubic control-point ratio for a quarter circle: 4/3 * tan(pi/8).
const CIRCLE_KAPPA = 0.5522847498307933;
// Arc length between lookup-table samples. The trail is stroked point to point,
// so this is also the longest chord that can ever appear on the loop.
const PATH_LUT_STEP_PX = 2;
// Longest frame the animation clock will honor. Beyond this (background tab,
// a long main-thread block) the clock stretches instead of teleporting.
const MAX_FRAME_MS = 64;

/* The curtain has to be laid down in the same frame the loader decides to run,
   or the incoming route paints through underneath it first. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
// How long until a painted trail point fades to half its opacity (gentle, so a
// full trail is present to be wiped away once the loop completes).
const TRAIL_HALFLIFE_MS = 1500;
// Blue exhaust hugging the plane — redrawn every frame (no persistence).
const AFTERBURNER_LEN = 140;
const AFTERBURNER_SEGMENTS = 20;
// Shadowed strokes are costly, so the glow is laid down in a few wide chunks
// and the fine alpha ramp is drawn on top without a shadow.
const AFTERBURNER_GLOW_CHUNKS = 4;
const AFTERBURNER_WIDTH = 3;
// Reveal (after the loop): window slide duration and how much earlier the trail
// wipe leads the window. Both use the same easing, so same speed/acceleration.
const REVEAL_DUR_MS = 1000 * TEMPO;
const TRAIL_LEAD_MS = 280 * TEMPO;
// Overlay fade-out once the strips are clear. Keep >= the CSS opacity duration.
const DISMISS_MS = 450 * TEMPO;
// Normalized start/end speeds of the reveal easing. Lower start = gentler start;
// end is kept the same so the final whip speed is unchanged.
const REVEAL_START_V = 0.5;
const REVEAL_END_V = 9;
// Marks that the visitor has seen the intro once this session.
const VISITED_KEY = "loader-visited";

/* Module state, so it resets on a real document load (including a refresh) but
   survives client-side navigation. That is the only way to tell "landed on this
   page" apart from "routed to this page", since the router keeps the bundle. */
let pendingDocumentLoad = true;

// The window is cut into layered horizontal strips. While covering the page they
// are seamless (identical background), so the layering is invisible until they
// slide — each strip leaves on its own delay / duration / easing, so the
// trailing (left) edge breaks into staggered, parallax-like steps.
type StripProfile = {
  delayMs: number;
  durMs: number;
  startV: number;
  endV: number;
};

const STRIP_PROFILES: StripProfile[] = [
  { delayMs: 0, durMs: 720, startV: 0.6, endV: 11 },
  { delayMs: 120, durMs: 1180, startV: 0.15, endV: 5 },
  { delayMs: 40, durMs: 860, startV: 1.0, endV: 13 },
  { delayMs: 210, durMs: 1360, startV: 0.1, endV: 4.5 },
  { delayMs: 70, durMs: 980, startV: 0.5, endV: 9 },
  { delayMs: 170, durMs: 1240, startV: 0.25, endV: 6.5 },
  { delayMs: 30, durMs: 800, startV: 0.8, endV: 12 },
  { delayMs: 250, durMs: 1300, startV: 0.2, endV: 5.5 },
].map((p) => ({ ...p, delayMs: p.delayMs * TEMPO, durMs: p.durMs * TEMPO }));
const STRIP_COUNT = STRIP_PROFILES.length;
const REVEAL_MAX_MS = Math.max(...STRIP_PROFILES.map((s) => s.delayMs + s.durMs));

type Geometry = {
  fullD: string;
  enterD: string;
  /** Enter plus the loop, if there is one. Reaching its end fires the reveal. */
  enterLoopD: string;
  width: number;
  height: number;
  cx: number;
  cy: number;
  flightMs: number;
  hasLoop: boolean;
};

function loopArcs(cx: number, cy: number, r: number): string {
  // Four cubic quarter-arcs. Starts at the bottom (cx, cy + r) with a +x
  // tangent and travels counterclockwise (bottom -> right -> top -> left).
  const k = r * CIRCLE_KAPPA;
  return (
    ` C ${cx + k} ${cy + r}, ${cx + r} ${cy + k}, ${cx + r} ${cy}` +
    ` C ${cx + r} ${cy - k}, ${cx + k} ${cy - r}, ${cx} ${cy - r}` +
    ` C ${cx - k} ${cy - r}, ${cx - r} ${cy - k}, ${cx - r} ${cy}` +
    ` C ${cx - r} ${cy + k}, ${cx - k} ${cy + r}, ${cx} ${cy + r}`
  );
}

/**
 * Arc-length lookup table for a path: positions and nose-corrected heading
 * sampled at a fixed step. Every per-frame query becomes an index and a lerp.
 */
type PathLut = {
  x: Float32Array;
  y: Float32Array;
  /** Degrees, unwrapped so interpolating across the loop never spins back. */
  angle: Float32Array;
  step: number;
  count: number;
  totalLen: number;
};

function buildPathLut(path: SVGPathElement, totalLen: number): PathLut {
  const count = Math.max(2, Math.ceil(totalLen / PATH_LUT_STEP_PX) + 1);
  const step = totalLen / (count - 1);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const angle = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const p = path.getPointAtLength(i * step);
    x[i] = p.x;
    y[i] = p.y;
  }

  let turns = 0;
  let prev = 0;
  for (let i = 0; i < count; i++) {
    const a = i === 0 ? 0 : i - 1;
    const b = i === count - 1 ? i : i + 1;
    const raw = (Math.atan2(y[b] - y[a], x[b] - x[a]) * 180) / Math.PI;
    if (i > 0) {
      if (raw - prev > 180) turns -= 360;
      else if (raw - prev < -180) turns += 360;
    }
    prev = raw;
    angle[i] = raw + turns + PLANE_NOSE_OFFSET;
  }

  return { x, y, angle, step, count, totalLen };
}

function buildGeometry(w: number, h: number, hasLoop: boolean): Geometry {
  const r = Math.min(w, h) * 0.13;
  const cx = w * 0.5;
  const cy = h * 0.46;
  const bottom = cy + r;

  if (!hasLoop) {
    // A gentle wave: enters high on the left, undulates across, and settles at
    // mid height on the right as the amplitude tapers out. Crossing the centre
    // fires the reveal, so the wave is emitted in two spans that join there.
    const xStart = -90;
    const xEnd = w + 140;
    const yStart = h * WAVE_START_RATIO;
    const yEnd = cy;
    const span = xEnd - xStart;
    const amp = h * WAVE_AMP_RATIO;
    const k = 2 * Math.PI * WAVE_CYCLES;

    const yAt = (x: number) => {
      const t = (x - xStart) / span;
      return yStart + (yEnd - yStart) * t + amp * (1 - t) * Math.sin(k * t);
    };
    const slopeAt = (x: number) => {
      const t = (x - xStart) / span;
      return (
        (yEnd - yStart) / span +
        (amp / span) * (k * (1 - t) * Math.cos(k * t) - Math.sin(k * t))
      );
    };

    // Hermite -> cubic Bezier per sub-span. Control points come from the
    // analytic slope, so the curve is tangent-continuous across every join,
    // including the one at the centre.
    const curveTo = (fromX: number, toX: number) => {
      const steps = Math.max(2, Math.round((toX - fromX) / WAVE_SEGMENT_PX));
      let d = "";
      for (let i = 0; i < steps; i++) {
        const xa = fromX + ((toX - fromX) * i) / steps;
        const xb = fromX + ((toX - fromX) * (i + 1)) / steps;
        const third = (xb - xa) / 3;
        d +=
          ` C ${xa + third} ${yAt(xa) + slopeAt(xa) * third},` +
          ` ${xb - third} ${yAt(xb) - slopeAt(xb) * third},` +
          ` ${xb} ${yAt(xb)}`;
      }
      return d;
    };

    const enterD = `M ${xStart} ${yAt(xStart)}${curveTo(xStart, cx)}`;
    return {
      fullD: `${enterD}${curveTo(cx, xEnd)}`,
      enterD,
      enterLoopD: enterD,
      width: w,
      height: h,
      cx,
      cy,
      flightMs: STRAIGHT_FLIGHT_MS,
      hasLoop,
    };
  }

  // Enter: swoop in from off-screen left, arriving at the loop bottom with a
  // horizontal (+x) tangent.
  const enterD = `M ${-90} ${bottom + r * 0.2} C ${w * 0.05} ${bottom}, ${
    cx - r * 1.4
  } ${bottom}, ${cx} ${bottom}`;

  // Loop: full counterclockwise circle, returning to the bottom with a +x tangent.
  const enterLoopD = `${enterD}${loopArcs(cx, cy, r)}`;

  // Exit: leave the loop bottom with a +x tangent and sweep up off the right edge.
  const fullD = `${enterLoopD} C ${cx + r * 1.4} ${bottom}, ${w * 0.72} ${
    h * 0.32
  }, ${w + 140} ${h * 0.2}`;

  return {
    fullD,
    enterD,
    enterLoopD,
    width: w,
    height: h,
    cx,
    cy,
    flightMs: LOOP_FLIGHT_MS,
    hasLoop,
  };
}

// Relative speed: full speed on entry/exit, dipping to VMIN at the loop apex.
const VMAX = 1;
const VMIN = 0.3;

// Reveal easing: integral of a linear speed ramp from startV to endV, so the
// slide accelerates from a gentle start to a fast finish.
function revealEaseV(p: number, startV: number, endV: number): number {
  const c = Math.max(0, Math.min(1, p));
  const denom = 0.5 * (startV + endV);
  return (startV * c + 0.5 * (endV - startV) * c * c) / denom;
}

function revealEase(p: number): number {
  return revealEaseV(p, REVEAL_START_V, REVEAL_END_V);
}

/**
 * True the first time this is called in a browsing session; consumed on read.
 * Survives refreshes, unlike the module flag above, so a visitor only gets the
 * "never seen this site" treatment once per tab.
 */
function consumeFirstVisit(): boolean {
  try {
    if (sessionStorage.getItem(VISITED_KEY) === "1") return false;
    sessionStorage.setItem(VISITED_KEY, "1");
    return true;
  } catch {
    // Private mode / storage disabled: treat every load as a first visit.
    return true;
  }
}

export function LoadingScreen({ isHome }: { isHome: boolean }) {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planeRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const afterburnerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const fullPathRef = useRef<SVGPathElement | null>(null);
  const enterPathRef = useRef<SVGPathElement | null>(null);
  const enterLoopPathRef = useRef<SVGPathElement | null>(null);

  const loadedRef = useRef(false);
  const revealStartRef = useRef<number | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const rafRef = useRef<number | null>(null);
  // Decided once per mount, so a double-invoked effect can't consume the
  // one-shot document-load and first-visit flags twice.
  const hasLoopRef = useRef<boolean | null>(null);

  const finish = useCallback(() => {
    document.body.style.overflow = "";
    setDone(true);
    window.setTimeout(() => setHidden(true), DISMISS_MS);
  }, []);

  // Always restore scroll if the overlay is dismissed or unmounted.
  useEffect(() => {
    if (done || hidden) {
      document.body.style.overflow = "";
    }
  }, [done, hidden]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Runs before paint so the curtain is already covering the viewport on the
  // frame a route lands — nothing of the incoming page shows through first.
  useIsomorphicLayoutEffect(() => {
    // Both flags are one-shot, so claim them before any early return — that
    // keeps "was this a document load" honest even when the loader is skipped.
    if (hasLoopRef.current === null) {
      const isDocumentLoad = pendingDocumentLoad;
      pendingDocumentLoad = false;
      const isFirstVisit = consumeFirstVisit();
      // Routing back to the home page is not an arrival, so it stays a wave.
      hasLoopRef.current = isDocumentLoad && (isHome || isFirstVisit);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deepLinkEntry = new URLSearchParams(window.location.search).get("entry");
    if (reduced || deepLinkEntry) {
      document.body.style.overflow = "";
      setDone(true);
      setHidden(true);
      return;
    }

    setGeo(
      buildGeometry(window.innerWidth, window.innerHeight, hasLoopRef.current)
    );
  }, [isHome]);

  useEffect(() => {
    if (!geo) return;
    const fullPath = fullPathRef.current;
    const enterPath = enterPathRef.current;
    const enterLoopPath = enterLoopPathRef.current;
    const plane = planeRef.current;
    const strips = stripRefs.current;
    if (!fullPath || !enterPath || !enterLoopPath || !plane) return;

    const totalLen = fullPath.getTotalLength();
    const exitStartLen = enterLoopPath.getTotalLength();
    const enterLen = enterPath.getTotalLength();

    // One-time sampling pass. After this the frame loop is pure array math —
    // no getPointAtLength, which previously ran 40+ times per frame.
    const lut = buildPathLut(fullPath, totalLen);
    const lutX = lut.x;
    const lutY = lut.y;

    const { width: w } = geo;
    const revealDistance = w + PLANE_W + 80;

    // Speed dips to VMIN at the loop apex and is VMAX everywhere else, so the
    // plane enters fast, slows climbing the loop, then speeds back up to exit.
    const loopLen = exitStartLen - enterLen;
    const loopTopLen = enterLen + loopLen / 2;
    const halfLoop = loopLen / 2 || 1;
    const speedAt = (len: number) => {
      // The straight pass has no apex to slow for — hold full speed throughout.
      if (!geo.hasLoop) return VMAX;
      const x = Math.abs(len - loopTopLen) / halfLoop;
      if (x >= 1) return VMAX;
      const bump = 0.5 * (1 + Math.cos(Math.PI * x));
      return VMAX - (VMAX - VMIN) * bump;
    };

    // Integrate dt = dLen / speed to map elapsed time -> arc length.
    const N = 720;
    const lenArr = new Float64Array(N + 1);
    const timeArr = new Float64Array(N + 1);
    let cum = 0;
    let prevLen = 0;
    let prevSpeed = speedAt(0);
    for (let i = 1; i <= N; i++) {
      const len = (i / N) * totalLen;
      const sp = speedAt(len);
      cum += (len - prevLen) / ((sp + prevSpeed) / 2);
      lenArr[i] = len;
      timeArr[i] = cum;
      prevLen = len;
      prevSpeed = sp;
    }
    const totalTime = cum || 1;

    const lenForTime = (t: number) => {
      const target = t * totalTime;
      let lo = 0;
      let hi = N;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (timeArr[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      if (lo === 0) return 0;
      const t0 = timeArr[lo - 1];
      const t1 = timeArr[lo];
      const f = t1 > t0 ? (target - t0) / (t1 - t0) : 0;
      return lenArr[lo - 1] + f * (lenArr[lo] - lenArr[lo - 1]);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    loadedRef.current = false;
    revealStartRef.current = null;
    setLoaded(false);

    // Reused so the frame loop allocates nothing.
    const cursor = { x: 0, y: 0, angle: 0 };

    const sampleAt = (len: number) => {
      const f = Math.max(0, Math.min(len, totalLen)) / lut.step;
      const i = Math.min(lut.count - 2, Math.floor(f));
      const u = f - i;
      cursor.x = lutX[i] + (lutX[i + 1] - lutX[i]) * u;
      cursor.y = lutY[i] + (lutY[i + 1] - lutY[i]) * u;
      cursor.angle = lut.angle[i] + (lut.angle[i + 1] - lut.angle[i]) * u;
      return cursor;
    };

    const setPlaneAt = (len: number) => {
      const p = sampleAt(len);
      plane.style.transform = `translate(${p.x - PLANE_W / 2}px, ${
        p.y - PLANE_H / 2
      }px) rotate(${p.angle}deg)`;
      return p;
    };

    /**
     * Trace the path between two arc lengths through every sample in between.
     * Frame duration no longer changes the shape that gets drawn.
     */
    const traceBetween = (
      target: CanvasRenderingContext2D,
      fromLen: number,
      toLen: number
    ) => {
      const a = sampleAt(fromLen);
      target.moveTo(a.x, a.y);
      const first = Math.max(0, Math.ceil(fromLen / lut.step));
      const last = Math.min(lut.count - 1, Math.floor(toLen / lut.step));
      for (let i = first; i <= last; i++) target.lineTo(lutX[i], lutY[i]);
      const b = sampleAt(toLen);
      target.lineTo(b.x, b.y);
    };

    const drawAfterburner = (
      burnCtx: CanvasRenderingContext2D,
      len: number,
      w: number,
      h: number
    ) => {
      burnCtx.clearRect(0, 0, w, h);

      const burnLen = Math.min(AFTERBURNER_LEN, len);
      if (burnLen < 2) return;

      const startLen = len - burnLen;
      burnCtx.save();
      burnCtx.lineCap = "round";
      burnCtx.lineJoin = "round";
      burnCtx.lineWidth = AFTERBURNER_WIDTH;

      // Glow first, in a few wide chunks: a blurred shadow per segment was the
      // single most expensive thing in the frame, and the blur hides the seams.
      burnCtx.shadowBlur = 8;
      burnCtx.shadowColor = "rgba(168, 85, 247, 0.5)";
      for (let i = 0; i < AFTERBURNER_GLOW_CHUNKS; i++) {
        const t0 = i / AFTERBURNER_GLOW_CHUNKS;
        const t1 = (i + 1) / AFTERBURNER_GLOW_CHUNKS;
        burnCtx.strokeStyle = `rgba(168, 85, 247, ${
          0.05 + ((t0 + t1) / 2) * 0.75
        })`;
        burnCtx.beginPath();
        traceBetween(burnCtx, startLen + t0 * burnLen, startLen + t1 * burnLen);
        burnCtx.stroke();
      }

      // Then the fine fade ramp, unshadowed and following the sampled curve.
      burnCtx.shadowBlur = 0;
      for (let i = 0; i < AFTERBURNER_SEGMENTS; i++) {
        const t0 = i / AFTERBURNER_SEGMENTS;
        const t1 = (i + 1) / AFTERBURNER_SEGMENTS;
        burnCtx.strokeStyle = `rgba(168, 85, 247, ${
          0.05 + ((t0 + t1) / 2) * 0.75
        })`;
        burnCtx.beginPath();
        traceBetween(burnCtx, startLen + t0 * burnLen, startLen + t1 * burnLen);
        burnCtx.stroke();
      }

      burnCtx.restore();
    };

    // Canvas trail: persistent, decaying over time via destination-out fades.
    const canvas = canvasRef.current;
    const afterburnerCanvas = afterburnerCanvasRef.current;
    const text = textRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas ? canvas.getContext("2d") : null;
    const burnCtx = afterburnerCanvas
      ? afterburnerCanvas.getContext("2d")
      : null;
    if (canvas && ctx) {
      canvas.width = geo.width * dpr;
      canvas.height = geo.height * dpr;
      canvas.style.width = `${geo.width}px`;
      canvas.style.height = `${geo.height}px`;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    if (afterburnerCanvas && burnCtx) {
      afterburnerCanvas.width = geo.width * dpr;
      afterburnerCanvas.height = geo.height * dpr;
      afterburnerCanvas.style.width = `${geo.width}px`;
      afterburnerCanvas.style.height = `${geo.height}px`;
      burnCtx.scale(dpr, dpr);
    }

    const stripEdges = strips.map(
      (strip) => strip?.querySelector<HTMLElement>("[data-strip-edge]") ?? null
    );

    let lastTime = 0;
    // Clock advances by clamped deltas rather than wall time, so a stalled or
    // backgrounded frame stretches the flight instead of jumping the plane.
    let elapsed = 0;
    let prevLenDrawn = 0;
    setPlaneAt(0);
    plane.style.opacity = "1";

    const tick = (now: number) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(now - lastTime, MAX_FRAME_MS);
      lastTime = now;
      elapsed += dt;
      const t = Math.min(elapsed / geo.flightMs, 1);

      // Time -> arc length via the speed profile (continuous speed, no jumps).
      const len = lenForTime(t);
      setPlaneAt(len);

      // Persistent trail that fades older points toward transparent over time.
      if (ctx) {
        const fade = 1 - Math.pow(0.5, dt / TRAIL_HALFLIFE_MS);
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${fade})`;
        ctx.fillRect(0, 0, geo.width, geo.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        traceBetween(ctx, prevLenDrawn, len);
        ctx.stroke();
      }
      if (burnCtx) {
        drawAfterburner(burnCtx, len, geo.width, geo.height);
      }
      prevLenDrawn = len;

      // Mark the moment the plane closes the loop: show "loaded!" and start the
      // reveal clock (the trail wipe begins now; the window follows a bit later).
      if (revealStartRef.current === null && len >= exitStartLen) {
        revealStartRef.current = elapsed;
        loadedRef.current = true;
        setLoaded(true);
      }

      let windowDone = false;
      if (revealStartRef.current !== null) {
        const since = elapsed - revealStartRef.current;
        // Trail wipe leads the window by TRAIL_LEAD_MS, using the base easing.
        const trailX = revealEase(since / REVEAL_DUR_MS) * revealDistance;
        const clip = `inset(0 0 0 ${trailX}px)`;
        if (canvas) canvas.style.clipPath = clip;
        if (afterburnerCanvas) afterburnerCanvas.style.clipPath = clip;

        // Each strip slides on its own profile -> staggered trailing edge.
        let midX = 0;
        for (let i = 0; i < STRIP_COUNT; i++) {
          const strip = strips[i];
          if (!strip) continue;
          const prof = STRIP_PROFILES[i];
          const x =
            revealEaseV((since - prof.delayMs) / prof.durMs, prof.startV, prof.endV) *
            revealDistance;
          strip.style.transform = `translateX(${x}px)`;
          const edge = stripEdges[i];
          if (edge) {
            edge.style.opacity = x > 2 ? String(Math.min(1, x / 28)) : "0";
          }
          if (i === STRIP_COUNT >> 1) midX = x;
        }
        // Erase the centered text in step with the strip sitting behind it.
        if (text) text.style.clipPath = `inset(0 0 0 ${midX}px)`;

        windowDone = since >= REVEAL_MAX_MS;
      }

      if (!windowDone) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = prevOverflow;
    };
  }, [geo, finish]);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-200 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {geo &&
        Array.from({ length: STRIP_COUNT }).map((_, i) => {
          const stripH = geo.height / STRIP_COUNT;
          const top = i * stripH;
          const height =
            i === STRIP_COUNT - 1 ? geo.height - top : stripH;
          return (
            <div
              key={i}
              ref={(el) => {
                stripRefs.current[i] = el;
              }}
              className="absolute left-0 will-change-transform"
              style={{ top, height, width: "100%" }}
            >
              <div className="absolute inset-0 bg-bg-base" aria-hidden />
              <div
                data-strip-edge
                className="pointer-events-none absolute bottom-0 left-0 top-0 w-px opacity-0"
                style={{
                  boxShadow:
                    "-6px 0 18px -4px rgba(168, 85, 247, 0.35), -1px 0 0 0 rgba(168, 85, 247, 0.55)",
                }}
                aria-hidden
              />
            </div>
          );
        })}

      {geo && (
        <>
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          />
          <canvas
            ref={afterburnerCanvasRef}
            className="pointer-events-none absolute inset-0"
            aria-hidden
          />
        </>
      )}

      {geo && (
        <div ref={textRef} className="pointer-events-none absolute inset-0">
          <div
            className="absolute"
            style={{
              left: geo.cx,
              top: geo.cy,
              transform: "translate(-50%, -50%)",
            }}
          >
            {loaded ? (
              <span className="flex items-center gap-2 font-display text-lg font-medium text-accent-purple">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                loaded!
              </span>
            ) : (
              <span className="font-display text-lg font-medium tracking-wide text-text-muted">
                loading...
              </span>
            )}
          </div>
        </div>
      )}

      {geo && (
        <div
          ref={planeRef}
          // Hidden until the flight loop places it: an unpositioned plane sits
          // in the top-left corner, which would flash before the first frame.
          className="absolute left-0 top-0 opacity-0 will-change-transform"
          style={{ width: PLANE_W, height: PLANE_H, transformOrigin: "center" }}
        >
          <PaperPlaneSvg
            gradientId="loader-plane-gradient"
            width={PLANE_W}
            height={PLANE_H}
          />
        </div>
      )}

      {geo && (
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
          <path ref={fullPathRef} d={geo.fullD} fill="none" />
          <path ref={enterPathRef} d={geo.enterD} fill="none" />
          <path ref={enterLoopPathRef} d={geo.enterLoopD} fill="none" />
        </svg>
      )}
    </div>
  );
}
