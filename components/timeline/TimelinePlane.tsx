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
const EDGE_OFFSET = 48;
const FOCUS_LINE = 0.42;
const BASE_ROT = 25;
const BOB_AMP = 8;
const BOB_FREQ = 2.1;
const SWAY_AMP = 6;
const SWAY_FREQ = 1.45;
const ROCK_AMP = 5;
const ROCK_FREQ = 1.05;
const PITCH_K = 18;
const TRAVEL_PITCH_K = 0.9;
const TAU_MS = 127;
/** Layout / focus picking is cheaper than every paint frame. */
const LAYOUT_MS = 48;

type CachedEntry = {
  el: HTMLElement;
  dot: HTMLElement;
  side: "left" | "right";
};

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
    let lastLayout = 0;
    let mirror = false;

    let cachedEntries: CachedEntry[] = [];
    let rootEl: HTMLElement | null = null;
    let best: { el: HTMLElement; y: number; d: number; side: "left" | "right" } | null =
      null;
    let mobileHidden = true;
    let inView = true;

    const refreshCache = () => {
      rootEl = document.querySelector<HTMLElement>("[data-timeline-root]");
      cachedEntries = Array.from(
        document.querySelectorAll<HTMLElement>("[data-timeline-entry]")
      ).flatMap((el) => {
        const dot = el.querySelector<HTMLElement>("[data-timeline-dot]");
        if (!dot) return [];
        const card = el.querySelector<HTMLElement>("[data-timeline-card]");
        const sideAttr = card?.getAttribute("data-timeline-side");
        const side: "left" | "right" =
          sideAttr === "left" || sideAttr === "right" ? sideAttr : "right";
        return [{ el, dot, side }];
      });
    };

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

    const updateLayout = () => {
      if (cachedEntries.length === 0) refreshCache();

      const focusY = window.innerHeight * FOCUS_LINE;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const atBottom = window.scrollY >= maxScroll - 8;

      best = null;
      mobileHidden = true;

      for (const entry of cachedEntries) {
        const r = entry.dot.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        mobileHidden = false;
        const cy = r.top + r.height / 2;
        if (atBottom && cy > focusY + 80) continue;
        const d = Math.abs(cy - focusY);
        if (!best || d < best.d) {
          best = { el: entry.el, y: cy, d, side: entry.side };
        }
      }

      if (!rootEl) {
        rootEl = document.querySelector<HTMLElement>("[data-timeline-root]");
      }
      const rootRect = rootEl?.getBoundingClientRect();
      inView =
        !!rootRect &&
        rootRect.top < window.innerHeight * 0.85 &&
        rootRect.bottom > window.innerHeight * 0.15;
    };

    const tick = (now: number) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(now - lastTime, 64);
      lastTime = now;
      const t = now / 1000;

      if (now - lastLayout >= LAYOUT_MS) {
        lastLayout = now;
        updateLayout();
      }

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

      const isRightBlock = best.side === "right";
      const dockLeft = isRightBlock;
      const focusSide: "left" | "right" = dockLeft ? "left" : "right";

      setFocused(best.el, focusSide);
      plane.style.opacity = "1";

      setMirror(!dockLeft);
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

      const vy = (curY - prevY) / (dt || 16);
      prevY = curY;

      let bobY = 0;
      let swayX = 0;
      let rot = s * BASE_ROT;

      if (!reduced) {
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
      lastLayout = 0;
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

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

    refreshCache();

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

    const mutation = root
      ? new MutationObserver(() => {
          refreshCache();
        })
      : null;
    mutation?.observe(root!, { childList: true, subtree: true });

    const onResize = () => {
      refreshCache();
      lastLayout = 0;
    };

    desktopMq.addEventListener("change", onDesktopChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });
    sync();

    return () => {
      stop();
      observer?.disconnect();
      mutation?.disconnect();
      desktopMq.removeEventListener("change", onDesktopChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
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
