"use client";

import { useEffect, useRef } from "react";

/* Node count follows viewport area so spacing (and therefore the perceived
   density of stars and links) is identical on a laptop and on a 4K display.
   The reference pair below is the viewport the mesh was originally tuned on. */
const REFERENCE_AREA = 1440 * 900;
const REFERENCE_POINTS = 160;
const POINT_DENSITY = REFERENCE_POINTS / REFERENCE_AREA;
/* Perf rails. The ceiling holds exact spacing through a 5K viewport; only
   6K and wider desktops thin out, and only slightly. */
const MIN_POINTS = 100;
const MAX_POINTS = 2000;
const WAVE_AMP = 6;
const DRIFT_AMP = 11;
const LINK_RATIO = 2.05;
const ACTIVITY_CUTOFF = 0.24;
/** Cap decorative canvas to ~30fps — plenty for ambient motion. */
const FRAME_MS = 1000 / 30;

type StarHue = "white" | "cyan" | "blue" | "purple" | "gold";

type Point = {
  bx: number;
  by: number;
  phase: number;
  freq: number;
  drift: number;
  starSize: number;
  starGlow: number;
  starHue: StarHue;
  twinkle: number;
};

const STAR_COLORS: Record<
  StarHue,
  { core: string; mid: string; outer: string }
> = {
  white: { core: "255,255,255", mid: "220,235,255", outer: "180,200,255" },
  cyan: { core: "220,255,255", mid: "0,212,255", outer: "0,160,200" },
  blue: { core: "200,240,255", mid: "0,180,255", outer: "0,100,180" },
  purple: { core: "240,220,255", mid: "168,85,247", outer: "100,40,180" },
  gold: { core: "255,250,230", mid: "255,210,120", outer: "200,140,60" },
};

function cellRand(i: number, j: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + j * 78.233 + salt * 43.758) * 43758.5453;
  return x - Math.floor(x);
}

function edgePhase(a: number, b: number): number {
  return cellRand(Math.min(a, b), Math.max(a, b), 31) * Math.PI * 2;
}

function pickStarHue(col: number, row: number): StarHue {
  const r = cellRand(col, row, 8);
  if (r < 0.38) return "white";
  if (r < 0.58) return "cyan";
  if (r < 0.74) return "blue";
  if (r < 0.9) return "purple";
  return "gold";
}

/** Hard-coded void in the bottom-right triangle half (split on TL→BR diagonal). */
function deadZoneFactor(
  x: number,
  y: number,
  viewW: number,
  viewH: number
): number {
  const depth = y / viewH - x / viewW;
  if (depth <= 0) return 1;
  const soft = 0.09;
  if (depth >= soft) return 0;
  const t = depth / soft;
  return 1 - t * t;
}

/** Moving density field — modulated by the bottom-right dead zone. */
function activity(
  x: number,
  y: number,
  t: number,
  viewW: number,
  viewH: number
): number {
  const n1 = Math.sin(x * 0.0048 + t * 0.19) * Math.cos(y * 0.0042 - t * 0.16);
  const n2 = Math.sin(x * 0.0095 - t * 0.11 + y * 0.0078) * 0.65;
  const n3 = Math.cos(x * 0.0028 + y * 0.0031 + t * 0.07) * 0.45;
  const field = Math.max(0, Math.min(1, (n1 + n2 + n3 + 1.35) / 2.75));
  return field * deadZoneFactor(x, y, viewW, viewH);
}

type Mesh = {
  points: Point[];
  maxLink: number;
  /** Per-frame scratch, sized once per mesh so draw() allocates nothing. */
  nx: Float64Array;
  ny: Float64Array;
  nact: Float64Array;
  active: Int32Array;
};

function buildPoints(width: number, height: number): Mesh {
  const area = width * height;
  const targetPoints = Math.min(
    MAX_POINTS,
    Math.max(MIN_POINTS, Math.round(area * POINT_DENSITY))
  );
  const spacing = Math.sqrt(area / targetPoints) * 0.92;
  const rowStep = spacing * (Math.sqrt(3) / 2);
  const points: Point[] = [];

  let row = 0;
  for (let y = -rowStep * 2; y < height + rowStep * 2; y += rowStep, row++) {
    const xOffset = (row & 1) * (spacing / 2);
    let col = 0;
    for (let x = -spacing * 2; x < width + spacing * 2; x += spacing, col++) {
      const jitter = spacing * 0.42;
      const r = cellRand(col, row, 6);
      points.push({
        bx: x + xOffset + (cellRand(col, row, 1) - 0.5) * jitter,
        by: y + (cellRand(col, row, 2) - 0.5) * jitter,
        phase: cellRand(col, row, 3) * Math.PI * 2,
        freq: 0.45 + cellRand(col, row, 4) * 0.85,
        drift: cellRand(col, row, 5) * Math.PI * 2,
        starSize: 0.45 + r * 1.2,
        starGlow: 0.45 + cellRand(col, row, 7) * 1.6,
        starHue: pickStarHue(col, row),
        twinkle: 0.6 + cellRand(col, row, 9) * 2.0,
      });
    }
  }

  return {
    points,
    maxLink: spacing * LINK_RATIO,
    nx: new Float64Array(points.length),
    ny: new Float64Array(points.length),
    nact: new Float64Array(points.length),
    active: new Int32Array(points.length),
  };
}

/** Numeric bucket id — string keys cost more than the lookup itself here. */
function bucketKey(cx: number, cy: number): number {
  return (cx + 4096) * 16384 + (cy + 4096);
}

/** Cheap star: solid discs for small nodes; one gradient only for bright ones. */
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  glow: number,
  hue: StarHue,
  twinkle: number,
  phase: number,
  time: number,
  brightness: number
) {
  const pulse = 0.55 + 0.45 * Math.sin(time * twinkle + phase);
  const coreR = size * (0.35 + pulse * 0.25);
  const b = brightness * pulse;
  const c = STAR_COLORS[hue];

  if (size > 0.95 && glow > 1.1) {
    const glowR = coreR * (2.2 + glow * 1.8);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    grad.addColorStop(0, `rgba(${c.core}, ${0.9 * b})`);
    grad.addColorStop(0.35, `rgba(${c.mid}, ${0.28 * b})`);
    grad.addColorStop(1, `rgba(${c.outer}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = `rgba(${c.mid}, ${0.55 * b})`;
    ctx.beginPath();
    ctx.arc(x, y, coreR * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * b})`;
  ctx.beginPath();
  ctx.arc(x, y, coreR * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Full-viewport wireframe with drifting density pockets, pulsing links,
 * star-like nodes, and a bottom-right triangular dead zone.
 */
export function WireframeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const meshRef = useRef<ReturnType<typeof buildPoints> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastDraw = 0;
    // Time spent hidden is subtracted from the animation clock, so returning
    // to the tab continues the motion instead of snapping it forward.
    let clockOffset = 0;
    let pausedAt: number | null = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap DPR — retina full-res is wasteful for soft ambient glow.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      meshRef.current = buildPoints(width, height);
    };

    const draw = (t: number) => {
      const mesh = meshRef.current;
      if (!mesh) return;

      const { points, maxLink, nx, ny, nact, active } = mesh;
      ctx.clearRect(0, 0, width, height);

      const time = t / 1000;
      const cell = maxLink * 0.72;
      const buckets = new Map<number, number[]>();
      let activeCount = 0;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const wave = reduced
          ? 0
          : Math.sin(time * p.freq + p.phase) * WAVE_AMP +
            Math.cos(time * p.freq * 0.65 + p.phase * 1.4) * (WAVE_AMP * 0.45);
        const driftX = reduced
          ? 0
          : Math.sin(time * 0.14 + p.drift) * DRIFT_AMP;
        const driftY = reduced
          ? 0
          : Math.cos(time * 0.12 + p.drift * 1.2) * DRIFT_AMP;
        const x = p.bx + wave * 0.5 + driftX;
        const y = p.by + wave + driftY;
        const act = activity(x, y, time, width, height);

        nx[i] = x;
        ny[i] = y;
        nact[i] = act;
        if (act < ACTIVITY_CUTOFF) continue;

        active[activeCount++] = i;
        const key = bucketKey(Math.floor(x / cell), Math.floor(y / cell));
        const list = buckets.get(key);
        if (list) list.push(i);
        else buckets.set(key, [i]);
      }

      // Each node lives in exactly one bucket and pairs are ordered j > i,
      // so every edge is visited once — no dedupe set needed.
      for (let k = 0; k < activeCount; k++) {
        const i = active[k];
        const ax = nx[i];
        const ay = ny[i];
        const aAct = nact[i];
        const cx = Math.floor(ax / cell);
        const cy = Math.floor(ay / cell);

        // 3×3 neighborhood is enough at this spacing.
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const neighbors = buckets.get(bucketKey(cx + ox, cy + oy));
            if (!neighbors) continue;

            for (const j of neighbors) {
              if (j <= i) continue;

              const dx = nx[j] - ax;
              const dy = ny[j] - ay;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > maxLink * 1.08) continue;

              const pulse = Math.sin(time * 0.95 + edgePhase(i, j));
              const linkStrength = Math.min(aAct, nact[j]);
              const limit =
                maxLink * (0.68 + 0.52 * pulse) * (0.55 + 0.45 * linkStrength);

              if (dist > limit) continue;

              const fade = (1 - dist / limit) * linkStrength;
              const alpha = fade * (0.4 + 0.6 * (0.5 + 0.5 * pulse)) * 0.42;

              ctx.strokeStyle =
                dist < maxLink * 0.58
                  ? `rgba(0, 212, 255, ${alpha})`
                  : `rgba(168, 85, 247, ${alpha})`;
              ctx.lineWidth = 0.55;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(nx[j], ny[j]);
              ctx.stroke();
            }
          }
        }
      }

      for (let k = 0; k < activeCount; k++) {
        const i = active[k];
        const p = points[i];
        const fade = Math.min(1, (nact[i] - ACTIVITY_CUTOFF) / 0.35);
        drawStar(
          ctx,
          nx[i],
          ny[i],
          p.starSize,
          p.starGlow,
          p.starHue,
          p.twinkle,
          p.phase,
          time,
          0.55 + fade * 0.45
        );
      }
    };

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);

      if (pausedAt !== null) {
        clockOffset += t - pausedAt;
        pausedAt = null;
        lastDraw = 0;
      }

      if (t - lastDraw < FRAME_MS) return;
      lastDraw = t;
      draw(t - clockOffset);
    };

    const start = () => {
      if (reduced || rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (pausedAt === null) pausedAt = performance.now();
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) draw(0);
      }, 180);
    };

    resize();

    if (reduced) {
      draw(0);
    } else {
      start();
    }

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // transform-gpu keeps the fixed canvas on its own compositor layer, so
      // scrolling the page over it composites instead of repainting it.
      className="pointer-events-none fixed inset-0 z-0 transform-gpu"
    />
  );
}
