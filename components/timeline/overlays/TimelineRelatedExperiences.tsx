import Link from "next/link";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { SectionLabel } from "@/components/timeline/overlays/SectionLabel";

type TimelineRelatedExperiencesProps = {
  experiences: PostTimelineRef[];
};

export function TimelineRelatedExperiences({
  experiences,
}: TimelineRelatedExperiencesProps) {
  if (experiences.length === 0) return null;

  return (
    <div className="border-t border-white/5 pt-8">
      <SectionLabel>Related experience</SectionLabel>
      <ul className="mt-4 space-y-3">
        {experiences.map((experience) => (
          <li key={experience.id}>
            <Link
              href={`/?entry=${experience.id}#timeline`}
              className="group block rounded-xl border border-white/5 bg-bg-base/40 px-4 py-3 transition-all hover:border-white/10 hover-accent-glow-sm"
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
