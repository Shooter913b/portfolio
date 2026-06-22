import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { TimelineBody } from "./TimelineBody";
import { TimelineDetailHeader } from "./TimelineDetailHeader";
import { TimelineLinks } from "./TimelineLinks";
import { SectionLabel } from "./SectionLabel";
import { TimelineMedia } from "../media/TimelineMedia";

type ProjectDetailProps = {
  entry: NarrativeEntry;
  titleId: string;
};

function projectHeroMedia(entry: NarrativeEntry) {
  const featured = entry.media.filter((item) => item.featured);
  const heroCandidate = featured[0] ?? entry.media.find((item) => item.type === "image");
  if (!heroCandidate) return { hero: undefined, gallery: entry.media };

  const gallery = entry.media.filter((item) => item.src !== heroCandidate.src);
  return { hero: heroCandidate, gallery };
}

export function ProjectDetail({ entry, titleId }: ProjectDetailProps) {
  const { hero, gallery } = projectHeroMedia(entry);
  const hasLinks = entry.links.length > 0;

  return (
    <div className="space-y-8">
      <TimelineDetailHeader entry={entry} titleId={titleId} />

      {hero && <TimelineMedia item={hero} variant="hero" />}

      {gallery.length > 0 && (
        <div>
          <SectionLabel>Gallery</SectionLabel>
          <div className="space-y-4">
            {gallery.map((item) => (
              <TimelineMedia
                key={item.src}
                item={item}
                variant={item.type === "image" ? "gallery" : "stack"}
              />
            ))}
          </div>
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
    </div>
  );
}
