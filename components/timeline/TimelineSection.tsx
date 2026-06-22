import type { ResolvedTimelineEntry } from "@/lib/schemas/timeline";
import { isNarrativeEntry } from "@/lib/schemas/timeline";
import type { Site } from "@/lib/schemas/site";
import type { BlogPost } from "@/lib/schemas/blog";
import { TimelineEntry } from "./TimelineEntry";
import { SkillsTimelineGroup } from "./SkillsTimelineGroup";
import { TimelinePlane } from "./TimelinePlane";
import { TimelineOverlayProvider } from "./TimelineOverlayContext";

type TimelineSectionProps = {
  entries: ResolvedTimelineEntry[];
  site: Site;
  posts: BlogPost[];
};

export function TimelineSection({ entries, site, posts }: TimelineSectionProps) {
  const narrativeEntries = entries.filter(isNarrativeEntry);

  return (
    <TimelineOverlayProvider entries={narrativeEntries} posts={posts}>
      <section
        id="timeline"
        data-timeline-root
        className="relative px-6 pb-[50vh] pt-16 md:px-12"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-accent-blue/50 via-accent-purple/40 to-accent-blue/50 md:block" />
        <TimelinePlane />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 md:gap-24">
          {entries.map((entry, index) =>
            entry.type === "skills" ? (
              <SkillsTimelineGroup key={entry.id} entry={entry} index={index} />
            ) : (
              <TimelineEntry key={entry.id} entry={entry} site={site} index={index} />
            )
          )}
        </div>
      </section>
    </TimelineOverlayProvider>
  );
}
