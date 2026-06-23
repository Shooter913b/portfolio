"use client";

"use client";

import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { splitDetailMedia } from "@/lib/timeline/featuredMedia";
import { TimelineBody } from "./TimelineBody";
import { TimelineDetailHeader } from "./TimelineDetailHeader";
import { TimelineLinks } from "./TimelineLinks";
import { SectionLabel } from "./SectionLabel";
import { MediaCollage } from "@/components/media/MediaCollage";
import { DetailFeaturedMedia } from "../media/DetailFeaturedMedia";
import { TimelineRelatedExperiences } from "./TimelineRelatedExperiences";
import { useTimelineEntries } from "../TimelineOverlayContext";
import { resolveProjectExperienceRefs } from "@/lib/timeline/relatedExperience";

type ProjectDetailProps = {
  entry: NarrativeEntry;
  titleId: string;
};

export function ProjectDetail({ entry, titleId }: ProjectDetailProps) {
  const allEntries = useTimelineEntries();
  const { featured, gallery } = splitDetailMedia(entry.media);
  const hasLinks = entry.links.length > 0;
  const relatedExperiences =
    entry.type === "project"
      ? resolveProjectExperienceRefs(entry, allEntries)
      : [];

  return (
    <div className="space-y-8">
      <TimelineDetailHeader entry={entry} titleId={titleId} />

      <DetailFeaturedMedia items={featured} label="Featured project media" />

      {gallery.length > 0 && (
        <div>
          <SectionLabel>Gallery</SectionLabel>
          <MediaCollage items={gallery} />
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-bg-base/40 p-5 sm:p-6">
        <SectionLabel>About this project</SectionLabel>
        <TimelineBody body={entry.body} />
      </div>

      {hasLinks && (
        <div>
          <SectionLabel>Links</SectionLabel>
          <TimelineLinks links={entry.links} />
        </div>
      )}

      <TimelineRelatedExperiences experiences={relatedExperiences} />
    </div>
  );
}
