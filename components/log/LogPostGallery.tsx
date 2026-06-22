import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { TimelineMedia } from "@/components/timeline/media/TimelineMedia";
import { LogPostPanel } from "./LogPostPanel";

type LogPostGalleryProps = {
  items: TimelineMediaItem[];
};

export function LogPostGallery({ items }: LogPostGalleryProps) {
  if (items.length === 0) return null;

  return (
    <LogPostPanel label="Gallery">
      <div className="space-y-4">
        {items.map((item, index) => (
          <TimelineMedia key={`${item.src}-${index}`} item={item} variant="stack" />
        ))}
      </div>
    </LogPostPanel>
  );
}
