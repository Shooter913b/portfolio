import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { splitDetailMedia } from "@/lib/timeline/featuredMedia";
import { TimelineBody } from "./TimelineBody";
import { TimelineDetailHeader } from "./TimelineDetailHeader";
import { TimelineLinks } from "./TimelineLinks";
import { SectionLabel } from "./SectionLabel";
import { MediaCollage } from "@/components/media/MediaCollage";
import { DetailFeaturedMedia } from "../media/DetailFeaturedMedia";

type EducationDetailProps = {
  entry: NarrativeEntry;
  titleId: string;
};

export function EducationDetail({ entry, titleId }: EducationDetailProps) {
  const { featured, gallery } = splitDetailMedia(entry.media);
  const hasLinks = entry.links.length > 0;

  return (
    <div className="space-y-8">
      <TimelineDetailHeader entry={entry} titleId={titleId} />

      <div className="rounded-2xl border border-white/5 bg-bg-base/40 p-5 sm:p-6">
        <SectionLabel>Overview</SectionLabel>
        <TimelineBody body={entry.body} />
      </div>

      <DetailFeaturedMedia items={featured} label="Featured education media" />

      {gallery.length > 0 && (
        <div>
          <SectionLabel>Gallery</SectionLabel>
          <MediaCollage items={gallery} />
        </div>
      )}

      {hasLinks && (
        <div>
          <SectionLabel>Links</SectionLabel>
          <TimelineLinks links={entry.links} />
        </div>
      )}
    </div>
  );
}
