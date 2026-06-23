import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { MediaCollage } from "@/components/media/MediaCollage";
import { LogPostPanel } from "./LogPostPanel";

type LogPostGalleryProps = {
  items: TimelineMediaItem[];
};

export function LogPostGallery({ items }: LogPostGalleryProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <LogPostPanel label="Gallery" headerOnly />
      <MediaCollage items={items} size="comfortable" bare />
    </section>
  );
}
