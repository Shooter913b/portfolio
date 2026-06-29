"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollIndicator() {
  const reducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Drive visibility through direct DOM writes (coalesced with rAF) so scrolling
  // never triggers React re-renders.
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    let ticking = false;
    let visible: boolean | null = null;

    const apply = () => {
      ticking = false;
      const next = window.scrollY < window.innerHeight * 0.35;
      if (next === visible) return;
      visible = next;
      button.style.opacity = next ? "1" : "0";
      button.style.pointerEvents = next ? "" : "none";
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTimeline = () => {
    document
      .querySelector<HTMLElement>("[data-timeline-root]")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Scroll to timeline"
      onClick={scrollToTimeline}
      className={cn(
        "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-text-muted opacity-100 transition-all duration-500 hover-accent-glow-sm hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-purple"
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
        Scroll
      </span>
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={cn(!reducedMotion && "scroll-indicator-arrow")}
      >
        <path
          d="M10 4v10M5 11l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
