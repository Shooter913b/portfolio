"use client";

import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { LogPostPanel } from "./LogPostPanel";

type LogPostMediaCarouselProps = {
  items: TimelineMediaItem[];
};

export function LogPostMediaCarousel({ items }: LogPostMediaCarouselProps) {
  if (items.length === 0) return null;

  return (
    <LogPostPanel contentClassName="!p-0">
      <MediaCarousel
        items={items}
        label="Post media"
        className="rounded-none border-0 bg-transparent"
        controlsClassName="[&_figure]:rounded-none"
      />
    </LogPostPanel>
  );
}
