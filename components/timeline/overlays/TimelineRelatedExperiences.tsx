import Link from "next/link";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { timelineEntryHref } from "@/lib/timeline/entryUrl";
import { SectionLabel } from "@/components/timeline/overlays/SectionLabel";

type TimelineRelatedExperiencesProps = {
  experiences: PostTimelineRef[];
};

export function TimelineRelatedExperiences({
  experiences,
}: TimelineRelatedExperiencesProps) {
  if (experiences.length === 0) return null;

  return (
    <div className="glass-seam-t pt-8">
      <SectionLabel>Related experience</SectionLabel>
      <ul className="mt-4 space-y-3">
        {experiences.map((experience) => (
          <li key={experience.id}>
            <Link
              href={timelineEntryHref(experience.id)}
              className="glass-pane-inset hover-glass group block px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Experience
              </p>
              <p className="mt-1 font-display text-base font-medium text-text-primary transition-colors group-hover:text-accent-blue">
                {experience.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
