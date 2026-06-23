import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { MediaCarousel } from "@/components/media/MediaCarousel";

type DetailFeaturedMediaProps = {
  items: TimelineMediaItem[];
  label?: string;
};

export function DetailFeaturedMedia({ items, label }: DetailFeaturedMediaProps) {
  if (items.length === 0) return null;

  return <MediaCarousel items={items} label={label} />;
}
