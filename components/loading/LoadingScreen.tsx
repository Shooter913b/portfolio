"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaperPlaneSvg } from "@/components/ui/PaperPlaneSvg";

/**
 * Full-screen intro: a paper plane flies in from the left, does a single
 * counterclockwise loop, then sweeps off to the right while "dragging" the
 * curtain away to reveal the page. Plays on every load.
 *
 * The flight is one continuous path with matching (+x) tangents at every join
 * and a single eased arc-length mapping, so speed/direction never jump.
 */

const PLANE_W = 40;
const PLANE_H = 29;
// The SVG nose natively points up-right (~ -32deg); offset so it leads travel.
const PLANE_NOSE_OFFSET = 32;
const TOTAL_MS = 2560;
const LOOP_SEGMENTS = 120;
// How long until a painted trail point fades to half its opacity (gentle, so a
// full trail is present to be wiped away once the loop completes).
const TRAIL_HALFLIFE_MS = 1500;
// Blue exhaust hugging the plane — redrawn every frame (no persistence).
const AFTERBURNER_LEN = 140;
const AFTERBURNER_SEGMENTS = 20;
const AFTERBURNER_WIDTH = 3;
// Reveal (after the loop): window slide duration and how much earlier the trail
// wipe leads the window. Both use the same easing, so same speed/acceleration.
const REVEAL_DUR_MS = 1000;
const TRAIL_LEAD_MS = 280;
// Normalized start/end speeds of the reveal easing. Lower start = gentler start;
// end is kept the same so the final whip speed is unchanged.
const REVEAL_START_V = 0.5;
const REVEAL_END_V = 9;

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
];
const STRIP_COUNT = STRIP_PROFILES.length;
const REVEAL_MAX_MS = Math.max(...STRIP_PROFILES.map((s) => s.delayMs + s.durMs));

type Geometry = {
  fullD: string;
  enterD: string;
  enterLoopD: string;
  width: number;
  height: number;
  cx: number;
  cy: number;
};

function loopSegments(cx: number, cy: number, r: number, n: number): string {
  // Starts at the bottom (cx, cy + r) with a +x tangent and travels
  // counterclockwise (bottom -> right -> top -> left -> bottom).
  let s = "";
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + r * Math.sin(a);
    const y = cy + r * Math.cos(a);
    s += ` L ${x} ${y}`;
  }
  return s;
}

function buildGeometry(w: number, h: number): Geometry {
  const r = Math.min(w, h) * 0.13;
  const cx = w * 0.5;
  const cy = h * 0.46;
  const bottom = cy + r;

  // Enter: swoop in from off-screen left, arriving at the loop bottom with a
  // horizontal (+x) tangent.
  const enterD = `M ${-90} ${bottom + r * 0.2} C ${w * 0.05} ${bottom}, ${
    cx - r * 1.4
  } ${bottom}, ${cx} ${bottom}`;

  // Loop: full counterclockwise circle, returning to the bottom with a +x tangent.
  const enterLoopD = `${enterD}${loopSegments(cx, cy, r, LOOP_SEGMENTS)}`;

  // Exit: leave the loop bottom with a +x tangent and sweep up off the right edge.
  const fullD = `${enterLoopD} C ${cx + r * 1.4} ${bottom}, ${w * 0.72} ${
    h * 0.32
  }, ${w + 140} ${h * 0.2}`;

  return { fullD, enterD, enterLoopD, width: w, height: h, cx, cy };
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

export function LoadingScreen() {
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

  const finish = useCallback(() => {
    document.body.style.overflow = "";
    setDone(true);
    window.setTimeout(() => setHidden(true), 450);
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

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deepLinkEntry = new URLSearchParams(window.location.search).get("entry");
    if (reduced || deepLinkEntry) {
      document.body.style.overflow = "";
      setDone(true);
      setHidden(true);
      return;
    }

    setGeo(buildGeometry(window.innerWidth, window.innerHeight));
  }, []);

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

    const { width: w } = geo;
    const revealDistance = w + PLANE_W + 80;

    // Speed dips to VMIN at the loop apex and is VMAX everywhere else, so the
    // plane enters fast, slows climbing the loop, then speeds back up to exit.
    const loopLen = exitStartLen - enterLen;
    const loopTopLen = enterLen + loopLen / 2;
    const halfLoop = loopLen / 2 || 1;
    const speedAt = (len: number) => {
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

    const setPlaneAt = (len: number) => {
      const clamped = Math.max(0, Math.min(len, totalLen));
      const p = fullPath.getPointAtLength(clamped);
      const ahead = fullPath.getPointAtLength(Math.min(clamped + 2, totalLen));
      const angle =
        (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI +
        PLANE_NOSE_OFFSET;
      plane.style.transform = `translate(${p.x - PLANE_W / 2}px, ${
        p.y - PLANE_H / 2
      }px) rotate(${angle}deg)`;
      return p;
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
      burnCtx.shadowBlur = 8;
      burnCtx.shadowColor = "rgba(168, 85, 247, 0.5)";

      for (let i = 0; i < AFTERBURNER_SEGMENTS; i++) {
        const t0 = i / AFTERBURNER_SEGMENTS;
        const t1 = (i + 1) / AFTERBURNER_SEGMENTS;
        const l0 = startLen + t0 * burnLen;
        const l1 = startLen + t1 * burnLen;
        const p0 = fullPath.getPointAtLength(l0);
        const p1 = fullPath.getPointAtLength(l1);
        const tMid = (t0 + t1) / 2;

        burnCtx.strokeStyle = `rgba(168, 85, 247, ${0.05 + tMid * 0.75})`;
        burnCtx.beginPath();
        burnCtx.moveTo(p0.x, p0.y);
        burnCtx.lineTo(p1.x, p1.y);
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

    let start = 0;
    let lastTime = 0;
    let prevPoint = setPlaneAt(0);

    const tick = (now: number) => {
      if (!start) {
        start = now;
        lastTime = now;
      }
      const dt = now - lastTime;
      lastTime = now;
      const t = Math.min((now - start) / TOTAL_MS, 1);

      // Time -> arc length via the speed profile (continuous speed, no jumps).
      const len = lenForTime(t);
      const p = setPlaneAt(len);

      // Persistent trail that fades older points toward transparent over time.
      if (ctx) {
        const fade = 1 - Math.pow(0.5, dt / TRAIL_HALFLIFE_MS);
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${fade})`;
        ctx.fillRect(0, 0, geo.width, geo.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      if (burnCtx) {
        drawAfterburner(burnCtx, len, geo.width, geo.height);
      }
      prevPoint = p;

      // Mark the moment the plane closes the loop: show "loaded!" and start the
      // reveal clock (the trail wipe begins now; the window follows a bit later).
      if (revealStartRef.current === null && len >= exitStartLen) {
        revealStartRef.current = now;
        loadedRef.current = true;
        setLoaded(true);
      }

      let windowDone = false;
      if (revealStartRef.current !== null) {
        const since = now - revealStartRef.current;
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
          const edge = strip.querySelector<HTMLElement>("[data-strip-edge]");
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
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-300 ${
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

      <div
        ref={planeRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: PLANE_W, height: PLANE_H, transformOrigin: "center" }}
      >
        <PaperPlaneSvg
          gradientId="loader-plane-gradient"
          width={PLANE_W}
          height={PLANE_H}
        />
      </div>

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
