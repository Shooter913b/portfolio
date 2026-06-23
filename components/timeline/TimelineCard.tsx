"use client";

import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { formatDateRange } from "@/lib/dates";
import { getFeaturedMedia } from "@/lib/timeline/featuredMedia";
import { resolveProjectExperienceRefs } from "@/lib/timeline/relatedExperience";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import { TimelineCardFeatured } from "./TimelineCardFeatured";
import { TimelineExperienceTag } from "./TimelineExperienceTag";
import { useTimelineEntries } from "./TimelineOverlayContext";

const MAX_TAGS = 3;

type TimelineCardProps = {
  entry: NarrativeEntry;
};

export function TimelineCard({ entry }: TimelineCardProps) {
  const allEntries = useTimelineEntries();
  const featuredMedia = getFeaturedMedia(entry.media);
  const hasFeatured = featuredMedia.length > 0;
  const hasDetails =
    entry.body.length > 0 || entry.media.length > 0 || entry.links.length > 0;
  const visibleTags = entry.tags.slice(0, MAX_TAGS);
  const extraTags = entry.tags.length - visibleTags.length;
  const relatedExperiences =
    entry.type === "project"
      ? resolveProjectExperienceRefs(entry, allEntries)
      : [];
  const metaLine = [entry.subtitle, entry.location].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        hasFeatured && "flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6"
      )}
    >
      {hasFeatured && (
        <div className="w-full shrink-0 lg:w-56">
          <TimelineCardFeatured items={featuredMedia} variant="inline" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-text-muted">
          {formatDateRange(entry.startDate, entry.endDate)}
        </p>
        <h3 className="mt-1 font-display text-lg font-medium text-text-primary">
          {entry.title}
        </h3>
        {metaLine && (
          <p className="mt-1 text-sm text-text-muted">{metaLine}</p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted">
          {entry.summary}
        </p>

        {(visibleTags.length > 0 || relatedExperiences.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {relatedExperiences.map((experience) => (
              <TimelineExperienceTag key={experience.id} experienceRef={experience} />
            ))}
            {visibleTags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {extraTags > 0 && (
              <span className="font-mono text-[10px] text-text-muted">
                +{extraTags}
              </span>
            )}
          </div>
        )}

        {hasDetails && (
          <p className="mt-3 font-mono text-xs text-accent-blue/80">
            View details →
          </p>
        )}
      </div>
    </div>
  );
}
