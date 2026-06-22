import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { cn } from "@/lib/cn";
import { TimelineBody } from "./TimelineBody";
import { TimelineDetailHeader } from "./TimelineDetailHeader";
import { TimelineLinks } from "./TimelineLinks";
import { SectionLabel } from "./SectionLabel";
import { TimelineMedia } from "../media/TimelineMedia";

type EducationDetailProps = {
  entry: NarrativeEntry;
  titleId: string;
};

export function EducationDetail({ entry, titleId }: EducationDetailProps) {
  const images = entry.media.filter((item) => item.type === "image");
  const hasLinks = entry.links.length > 0;

  return (
    <div className="space-y-8">
      <TimelineDetailHeader entry={entry} titleId={titleId} />

      <div className="rounded-2xl border border-white/5 bg-bg-base/40 p-5 sm:p-6">
        <SectionLabel>Overview</SectionLabel>
        <TimelineBody body={entry.body} />
      </div>

      {images.length === 1 && (
        <TimelineMedia item={images[0]} variant="hero" />
      )}

      {images.length > 1 && (
        <div>
          <SectionLabel>Collage</SectionLabel>
          <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((item, index) => (
              <div
                key={item.src}
                className={cn(
                  "min-h-0 min-w-0 overflow-hidden",
                  index === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""
                )}
              >
                <TimelineMedia
                  item={item}
                  variant="gallery"
                  className="h-full"
                  fill
                />
              </div>
            ))}
          </div>
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
