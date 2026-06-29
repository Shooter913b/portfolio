"use client";

import { useEffect, useRef } from "react";
import { PaperPlaneSvg } from "@/components/ui/PaperPlaneSvg";

/**
 * Scroll-driven paper plane that escorts the timeline. It flies in from the
 * right, snaps beside the focused entry (left of left-side blocks, right of
 * right-side blocks with a mirrored sprite), and — while parked — undulates
 * with coupled pitch/bank so it reads like a plane soaring, not just bobbing.
 *
 * Reads the timeline DOM directly and toggles `data-focused`, so it stays
 * decoupled and never re-renders React.
 */

const PLANE_W = 38;
const PLANE_H = 28;
// Plane center offset from the spine, into the empty column opposite the card.
const EDGE_OFFSET = 48;
// Where on screen the focused dot wants to settle (fraction of viewport h).
const FOCUS_LINE = 0.42;
// Resting heading magnitude (deg); a slight bow-up glide.
const BASE_ROT = 25;
// Idle flight motion.
const BOB_AMP = 8;
const BOB_FREQ = 2.1;
const SWAY_AMP = 6;
const SWAY_FREQ = 1.45;
const ROCK_AMP = 5;
const ROCK_FREQ = 1.05;
// Pitch coupling: nose leads the climb/descent of the idle path + scroll travel.
const PITCH_K = 18;
const TRAVEL_PITCH_K = 0.9;
// Exponential smoothing time constant (ms) — lower = snappier snap.
const TAU_MS = 127;

export function TimelinePlane() {
  const planeRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const plane = planeRef.current;
    const svg = svgRef.current;
    if (!plane || !svg) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let running = false;
    const schedule = () => {
      if (running) rafRef.current = requestAnimationFrame(tick);
    };

    let curX = window.innerWidth + 160;
    let curY = window.innerHeight * FOCUS_LINE;
    let prevY = curY;
    let initialized = false;
    let focusedEl: Element | null = null;
    let lastTime = 0;
    let mirror = false; // sprite faces left when true

    const setFocused = (el: Element | null, side?: "left" | "right") => {
      if (!el) {
        if (focusedEl) {
          focusedEl.removeAttribute("data-focused");
          focusedEl.removeAttribute("data-focus-side");
          focusedEl = null;
        }
        return;
      }

      if (el === focusedEl) {
        if (side && el.getAttribute("data-focus-side") !== side) {
          el.setAttribute("data-focus-side", side);
        }
        return;
      }

      if (focusedEl) {
        focusedEl.removeAttribute("data-focused");
        focusedEl.removeAttribute("data-focus-side");
      }
      el.setAttribute("data-focused", "true");
      if (side) el.setAttribute("data-focus-side", side);
      focusedEl = el;
    };

    const setMirror = (next: boolean) => {
      if (next === mirror) return;
      mirror = next;
      svg.style.transform = `scaleX(${mirror ? -1 : 1})`;
    };

    const tick = (now: number) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(now - lastTime, 64);
      lastTime = now;
      const t = now / 1000;

      const entries = Array.from(
        document.querySelectorAll<HTMLElement>("[data-timeline-entry]")
      );

      const focusY = window.innerHeight * FOCUS_LINE;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const atBottom = window.scrollY >= maxScroll - 8;

      let best: { el: HTMLElement; y: number; d: number } | null = null;
      let mobileHidden = true;

      for (const entry of entries) {
        const dot = entry.querySelector<HTMLElement>("[data-timeline-dot]");
        if (!dot) continue;
        const r = dot.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        mobileHidden = false;
        const cy = r.top + r.height / 2;
        // Near page bottom, only consider dots that can still reach the focus band.
        if (atBottom && cy > focusY + 80) continue;
        const d = Math.abs(cy - focusY);
        if (!best || d < best.d) best = { el: entry, y: cy, d };
      }

      const root = document.querySelector<HTMLElement>("[data-timeline-root]");
      const rootRect = root?.getBoundingClientRect();
      const inView =
        !!rootRect &&
        rootRect.top < window.innerHeight * 0.85 &&
        rootRect.bottom > window.innerHeight * 0.15;

      if (mobileHidden || !best || !inView) {
        setFocused(null);
        const targetX = window.innerWidth + 160;
        curX += (targetX - curX) * (1 - Math.exp(-dt / 293));
        plane.style.opacity = "0";
        plane.style.transform = `translate(${curX - PLANE_W / 2}px, ${
          curY - PLANE_H / 2
        }px) rotate(${BASE_ROT}deg)`;
        prevY = curY;
        schedule();
        return;
      }

      const card = best.el.querySelector<HTMLElement>("[data-timeline-card]");
      const side = card?.getAttribute("data-timeline-side") ?? "right";
      const isRightBlock = side === "right";
      const dockLeft = isRightBlock;
      const focusSide: "left" | "right" = dockLeft ? "left" : "right";

      setFocused(best.el, focusSide);
      plane.style.opacity = "1";

      // The plane sits on the side OPPOSITE the focused card and points across
      // the spine toward it: right-side block -> plane on the left (facing
      // right), left-side block -> plane on the right (facing left).
      setMirror(!dockLeft); // on left -> faces right (unmirrored); on right -> mirrored
      // s = facing sign: +1 faces right, -1 faces left.
      const s = dockLeft ? 1 : -1;

      const spineX = window.innerWidth / 2;
      const targetX = spineX + (dockLeft ? -EDGE_OFFSET : EDGE_OFFSET);
      const targetY = best.y;

      if (!initialized) {
        curY = targetY;
        prevY = targetY;
        initialized = true;
      }

      const k = reduced ? 1 : 1 - Math.exp(-dt / TAU_MS);
      curX += (targetX - curX) * k;
      curY += (targetY - curY) * k;

      const dist = Math.hypot(targetX - curX, targetY - curY);
      const settle = Math.max(0, Math.min(1, 1 - dist / 160));

      // Scroll-travel vertical velocity (px/ms) -> pitch while flying between points.
      const vy = (curY - prevY) / (dt || 16);
      prevY = curY;

      let bobY = 0;
      let swayX = 0;
      let rot = s * BASE_ROT;

      if (!reduced) {
        // Undulating hover path (ellipse) with pitch coupled to its vertical velocity.
        const bobPhase = t * BOB_FREQ;
        bobY = Math.sin(bobPhase) * BOB_AMP * settle;
        swayX = s * Math.cos(t * SWAY_FREQ) * SWAY_AMP * settle;
        const idlePitch = s * Math.cos(bobPhase) * PITCH_K * settle;
        const rock = Math.sin(t * ROCK_FREQ + 0.5) * ROCK_AMP * settle;
        const travelPitch =
          s * Math.max(-20, Math.min(20, vy * TRAVEL_PITCH_K)) * (1 - settle);
        rot = s * BASE_ROT + idlePitch + rock + travelPitch;
      }

      plane.style.transform = `translate(${curX + swayX - PLANE_W / 2}px, ${
        curY + bobY - PLANE_H / 2
      }px) rotate(${rot}deg)`;

      schedule();
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Only drive the loop when it can actually be seen: desktop viewport, tab
    // visible, and the timeline scrolled into view. The plane is `hidden` below
    // md, so without these gates we'd burn frames + layout reads for nothing.
    const desktopMq = window.matchMedia("(min-width: 768px)");
    let desktop = desktopMq.matches;
    let visible = !document.hidden;
    let onScreen = true;

    const sync = () => {
      if (desktop && visible && onScreen) {
        start();
      } else {
        stop();
        setFocused(null);
        plane.style.opacity = "0";
      }
    };

    const onDesktopChange = (e: MediaQueryListEvent) => {
      desktop = e.matches;
      sync();
    };
    const onVisibility = () => {
      visible = !document.hidden;
      sync();
    };

    const root = document.querySelector("[data-timeline-root]");
    const observer = root
      ? new IntersectionObserver(
          ([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
          },
          { rootMargin: "200px 0px" }
        )
      : null;
    observer?.observe(root!);

    desktopMq.addEventListener("change", onDesktopChange);
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      stop();
      observer?.disconnect();
      desktopMq.removeEventListener("change", onDesktopChange);
      document.removeEventListener("visibilitychange", onVisibility);
      setFocused(null);
    };
  }, []);

  return (
    <div
      ref={planeRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-40 hidden opacity-0 will-change-transform md:block"
      style={{ width: PLANE_W, height: PLANE_H }}
    >
      <PaperPlaneSvg
        ref={svgRef}
        gradientId="timeline-plane-gradient"
        width={PLANE_W}
        height={PLANE_H}
      />
    </div>
  );
}
