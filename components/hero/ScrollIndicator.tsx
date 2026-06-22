"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollIndicator() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 0.35);
    };

    onScroll();
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
      type="button"
      aria-label="Scroll to timeline"
      onClick={scrollToTimeline}
      className={cn(
        "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-text-muted transition-all duration-500 hover-accent-glow-sm hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-purple",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
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
