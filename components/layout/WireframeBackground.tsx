"use client";

import { useEffect, useRef } from "react";

const TARGET_POINTS = 220;
const WAVE_AMP = 7;
const DRIFT_AMP = 14;
const LINK_RATIO = 2.15;
const ACTIVITY_CUTOFF = 0.22;

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
  // Positive depth = below the top-left → bottom-right diagonal.
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
  const n4 = Math.sin((x + y) * 0.003 + t * 0.24) * 0.35;
  const field = Math.max(0, Math.min(1, (n1 + n2 + n3 + n4 + 1.55) / 3.1));
  return field * deadZoneFactor(x, y, viewW, viewH);
}

function buildPoints(width: number, height: number): { points: Point[]; maxLink: number } {
  const spacing = Math.sqrt((width * height) / TARGET_POINTS) * 0.92;
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
        starSize: 0.45 + r * 1.35,
        starGlow: 0.5 + cellRand(col, row, 7) * 2.2,
        starHue: pickStarHue(col, row),
        twinkle: 0.6 + cellRand(col, row, 9) * 2.4,
      });
    }
  }

  return { points, maxLink: spacing * LINK_RATIO };
}

function bucketKey(x: number, y: number, cell: number): string {
  return `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
}

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
  const glowR = coreR * (2.5 + glow * 2.8);
  const b = brightness * pulse;
  const c = STAR_COLORS[hue];

  const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grad.addColorStop(0, `rgba(${c.core}, ${0.95 * b})`);
  grad.addColorStop(0.12, `rgba(${c.mid}, ${0.55 * b})`);
  grad.addColorStop(0.45, `rgba(${c.outer}, ${0.18 * b})`);
  grad.addColorStop(1, `rgba(${c.outer}, 0)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * b})`;
  ctx.beginPath();
  ctx.arc(x, y, coreR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  if (size > 1.1 && glow > 1.4) {
    ctx.strokeStyle = `rgba(${c.mid}, ${0.25 * b})`;
    ctx.lineWidth = 0.5;
    const spike = coreR * 1.8;
    ctx.beginPath();
    ctx.moveTo(x - spike, y);
    ctx.lineTo(x + spike, y);
    ctx.moveTo(x, y - spike);
    ctx.lineTo(x, y + spike);
    ctx.stroke();
  }
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      const { points, maxLink } = mesh;
      ctx.clearRect(0, 0, width, height);

      const time = t / 1000;
      const nodes = points.map((p) => {
        const wave = reduced
          ? 0
          : Math.sin(time * p.freq + p.phase) * WAVE_AMP +
            Math.cos(time * p.freq * 0.65 + p.phase * 1.4) * (WAVE_AMP * 0.45);
        const driftX = reduced ? 0 : Math.sin(time * 0.14 + p.drift) * DRIFT_AMP;
        const driftY = reduced ? 0 : Math.cos(time * 0.12 + p.drift * 1.2) * DRIFT_AMP;
        const x = p.bx + wave * 0.5 + driftX;
        const y = p.by + wave + driftY;
        const act = activity(x, y, time, width, height);
        return { x, y, act, p };
      });

      const cell = maxLink * 0.72;
      const buckets = new Map<string, number[]>();
      const active: number[] = [];

      nodes.forEach((n, idx) => {
        if (n.act < ACTIVITY_CUTOFF) return;
        active.push(idx);
        const key = bucketKey(n.x, n.y, cell);
        const list = buckets.get(key);
        if (list) list.push(idx);
        else buckets.set(key, [idx]);
      });

      const drawn = new Set<string>();

      for (const i of active) {
        const a = nodes[i];
        const cx = Math.floor(a.x / cell);
        const cy = Math.floor(a.y / cell);

        for (let ox = -2; ox <= 2; ox++) {
          for (let oy = -2; oy <= 2; oy++) {
            const neighbors = buckets.get(`${cx + ox},${cy + oy}`);
            if (!neighbors) continue;

            for (const j of neighbors) {
              if (j <= i) continue;

              const key = `${i}-${j}`;
              if (drawn.has(key)) continue;

              const b = nodes[j];
              const dist = Math.hypot(b.x - a.x, b.y - a.y);
              if (dist > maxLink * 1.08) continue;

              const pulse = Math.sin(time * 0.95 + edgePhase(i, j));
              const linkStrength = Math.min(a.act, b.act);
              const limit =
                maxLink * (0.68 + 0.52 * pulse) * (0.55 + 0.45 * linkStrength);

              if (dist > limit) continue;
              drawn.add(key);

              const fade = (1 - dist / limit) * linkStrength;
              const alpha = fade * (0.4 + 0.6 * (0.5 + 0.5 * pulse)) * 0.42;

              ctx.strokeStyle =
                dist < maxLink * 0.58
                  ? `rgba(0, 212, 255, ${alpha})`
                  : `rgba(168, 85, 247, ${alpha})`;
              ctx.lineWidth = 0.55;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      for (const i of active) {
        const n = nodes[i];
        const fade = Math.min(1, (n.act - ACTIVITY_CUTOFF) / 0.35);
        drawStar(
          ctx,
          n.x,
          n.y,
          n.p.starSize,
          n.p.starGlow,
          n.p.starHue,
          n.p.twinkle,
          n.p.phase,
          time,
          0.55 + fade * 0.45
        );
      }
    };

    const loop = (t: number) => {
      draw(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced || rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Pause the animation loop whenever the tab is backgrounded — there's no
    // point spending frames on a decorative canvas nobody can see.
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
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
