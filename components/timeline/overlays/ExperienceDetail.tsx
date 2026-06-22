import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { TimelineBody } from "./TimelineBody";
import { TimelineDetailHeader } from "./TimelineDetailHeader";
import { TimelineLinks } from "./TimelineLinks";
import { SectionLabel } from "./SectionLabel";
import { TimelineMedia } from "../media/TimelineMedia";

type ExperienceDetailProps = {
  entry: NarrativeEntry;
  titleId: string;
};

export function ExperienceDetail({ entry, titleId }: ExperienceDetailProps) {
  const hasMedia = entry.media.length > 0;
  const hasLinks = entry.links.length > 0;

  return (
    <div className="space-y-8">
      <TimelineDetailHeader entry={entry} titleId={titleId} />

      <div
        className={
          hasMedia
            ? "grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start"
            : "space-y-8"
        }
      >
        <div className="rounded-2xl border border-white/5 bg-bg-base/40 p-5 sm:p-6">
          <SectionLabel>Highlights</SectionLabel>
          <TimelineBody body={entry.body} />
        </div>

        {hasMedia && (
          <div className="min-w-0">
            <SectionLabel>Gallery</SectionLabel>
            <div className="space-y-4">
              {entry.media.map((item) => (
                <TimelineMedia key={item.src} item={item} variant="stack" />
              ))}
            </div>
          </div>
        )}
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
