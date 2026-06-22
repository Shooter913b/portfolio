"use client";

import { Suspense, useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { BlogPost } from "@/lib/schemas/blog";
import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackTimelineDetailOpen } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { TimelineCardSide } from "./TimelineOverlayContext";
import { TimelineCard } from "./TimelineCard";
import { ExperienceDetail } from "./overlays/ExperienceDetail";
import { ProjectDetail } from "./overlays/ProjectDetail";
import { EducationDetail } from "./overlays/EducationDetail";
import { TimelineRelatedLogs } from "./overlays/TimelineRelatedLogs";

type TimelineDetailOverlayProps = {
  entry: NarrativeEntry;
  side: TimelineCardSide;
  originRect: DOMRect | null;
  relatedPosts: BlogPost[];
  onClose: () => void;
};

export function TimelineDetailOverlay({
  entry,
  side,
  originRect,
  relatedPosts,
  onClose,
}: TimelineDetailOverlayProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    trackTimelineDetailOpen(entry.id);
  }, [entry.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // The card flips toward the timeline (center) while expanding, landing on
  // its back face (the detail view). We morph from the clicked card's screen
  // rect (translate + scale) and spin 180deg in one motion.
  useLayoutEffect(() => {
    const flip = flipRef.current;
    if (!flip || reducedMotion) return;

    const final = flip.getBoundingClientRect();
    if (final.width === 0 || final.height === 0) return;

    const endDeg = side === "left" ? 180 : -180;

    let startTransform: string;
    if (originRect && originRect.width > 0 && originRect.height > 0) {
      const sx = originRect.width / final.width;
      const sy = originRect.height / final.height;
      const tx =
        originRect.left + originRect.width / 2 - (final.left + final.width / 2);
      const ty =
        originRect.top + originRect.height / 2 - (final.top + final.height / 2);
      startTransform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy}) rotateY(0deg)`;
    } else {
      startTransform = "scale(0.6) rotateY(0deg)";
    }

    const animation = flip.animate(
      [
        { transform: startTransform },
        {
          transform: `translate(0px, 0px) scale(1, 1) rotateY(${endDeg}deg)`,
        },
      ],
      {
        duration: 720,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        fill: "both",
      }
    );

    return () => animation.cancel();
  }, [originRect, side, reducedMotion]);

  const content = (() => {
    switch (entry.type) {
      case "experience":
        return <ExperienceDetail entry={entry} titleId={titleId} />;
      case "project":
        return <ProjectDetail entry={entry} titleId={titleId} />;
      case "education":
        return <EducationDetail entry={entry} titleId={titleId} />;
    }
  })();

  const maxWidth = entry.type === "experience" ? "max-w-4xl" : "max-w-3xl";

  const backFace = (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-bg-elevated shadow-2xl accent-glow-xl">
      {/* Top gradient accent bar */}
      <div className="accent-gradient-bg h-1 w-full" aria-hidden />

      {/* Dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.04) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 55%)",
        }}
      />

      {/* Close button */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-base/60 text-text-muted backdrop-blur transition-colors hover:border-accent-blue/40 hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="relative p-6 pr-14 sm:p-10 sm:pr-14">
        {content}
        <TimelineRelatedLogs entry={entry} posts={relatedPosts} />
      </div>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-bg-base/85 backdrop-blur-md",
          !reducedMotion && "animate-backdrop-in"
        )}
        aria-label="Close details"
        onClick={onClose}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          !reducedMotion && "animate-backdrop-in"
        )}
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgb(0 212 255 / 0.12) 0%, transparent 70%), radial-gradient(50% 40% at 100% 100%, rgb(168 85 247 / 0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className={cn(
          "timeline-flip-perspective relative my-4 w-full sm:my-10",
          maxWidth
        )}
      >
        {reducedMotion ? (
          <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
            {backFace}
          </div>
        ) : (
          <div
            ref={flipRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="timeline-flip"
          >
            {/* FRONT — the timeline card, shown as the flip begins */}
            <div
              aria-hidden
              className="timeline-flip-face overflow-hidden rounded-xl border border-white/10 bg-bg-elevated p-4"
            >
              <TimelineCard entry={entry} />
            </div>

            {/* BACK — the expanded detail view */}
            <div className="timeline-flip-face timeline-flip-back">
              {backFace}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
