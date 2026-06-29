"use client";

import type { ResolvedTimelineEntry, ResolvedSkillsEntry } from "@/lib/schemas/timeline";
import { isNarrativeEntry } from "@/lib/schemas/timeline";
import type { Site } from "@/lib/schemas/site";
import { cn } from "@/lib/cn";
import { ResumeBlock } from "./ResumeBlock";
import { TimelineCard } from "./TimelineCard";
import { useTimelineOverlay } from "./TimelineOverlayContext";

type TimelineEntryProps = {
  entry: Exclude<ResolvedTimelineEntry, ResolvedSkillsEntry>;
  site: Site;
  index: number;
};

export function TimelineEntry({ entry, site, index }: TimelineEntryProps) {
  const isLeft = index % 2 === 0;
  const isResume = entry.type === "resume";
  const isNarrative = isNarrativeEntry(entry);
  const { openOverlay } = useTimelineOverlay();

  const content =
    entry.type === "resume" ? (
      <ResumeBlock site={site} />
    ) : (
      <TimelineCard entry={entry} />
    );

  const cardClassName = cn(
    "timeline-card rounded-xl border border-white/5 bg-bg-elevated transition-all duration-300 hover:border-white/10 hover-accent-glow-sm",
    entry.type === "resume" && "timeline-card-resume",
    isLeft ? "md:col-start-1" : "md:col-start-2",
    isResume ? "p-6 opacity-90 hover:opacity-100" : "p-4 opacity-75 hover:opacity-90",
    isNarrative && "w-full cursor-pointer appearance-none text-left font-inherit"
  );

  return (
    <div data-timeline-entry={entry.id} className="relative">
      <div
        data-timeline-dot
        className="timeline-dot absolute left-1/2 top-8 hidden h-3 w-3 rounded-full ring-4 ring-bg-base md:block"
        aria-hidden
      />
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
        {isNarrative ? (
          <div
            tabIndex={0}
            data-timeline-card
            data-timeline-side={isLeft ? "left" : "right"}
            className={cardClassName}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest("[data-carousel-control]") ||
                target.closest("[data-media-expand]") ||
                target.closest("[data-experience-link]")
              ) {
                return;
              }
              openOverlay(
                entry.id,
                isLeft ? "left" : "right",
                event.currentTarget.getBoundingClientRect()
              );
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              openOverlay(
                entry.id,
                isLeft ? "left" : "right",
                event.currentTarget.getBoundingClientRect()
              );
            }}
            aria-label={`View details for ${entry.title}`}
          >
            {content}
          </div>
        ) : (
          <div
            data-timeline-card
            data-timeline-side={isLeft ? "left" : "right"}
            className={cardClassName}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
