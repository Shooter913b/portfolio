import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { MediaCollage } from "@/components/media/MediaCollage";
import { LogPostPanel } from "./LogPostPanel";

type LogPostGalleryProps = {
  items: TimelineMediaItem[];
};

export function LogPostGallery({ items }: LogPostGalleryProps) {
  if (items.length === 0) return null;

  return (
    <LogPostPanel label="Gallery">
      <MediaCollage items={items} />
    </LogPostPanel>
  );
}
