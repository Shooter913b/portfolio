"use client";

import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { cn } from "@/lib/cn";
import { useTimelineOverlay } from "./TimelineOverlayContext";

type TimelineExperienceTagProps = {
  experienceRef: PostTimelineRef;
  className?: string;
};

export function TimelineExperienceTag({
  experienceRef,
  className,
}: TimelineExperienceTagProps) {
  const { openOverlay } = useTimelineOverlay();

  return (
    <button
      type="button"
      data-experience-link=""
      onClick={(event) => {
        event.stopPropagation();
        openOverlay(experienceRef.id);
      }}
      className={cn(
        "glass-tag inline-flex max-w-full items-center gap-1.5 px-2.5 py-0.5 font-mono text-xs transition-[box-shadow,filter] duration-200 hover:brightness-110",
        className
      )}
      title={`View experience: ${experienceRef.title}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0" aria-hidden>
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
      <span className="truncate">{experienceRef.title}</span>
    </button>
  );
}
