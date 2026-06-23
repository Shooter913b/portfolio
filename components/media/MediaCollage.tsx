import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { TimelineMedia } from "@/components/timeline/media/TimelineMedia";
import { cn } from "@/lib/cn";

type MediaCollageProps = {
  items: TimelineMediaItem[];
  className?: string;
};

export function MediaCollage({ items, className }: MediaCollageProps) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className={cn("max-w-xs", className)}>
        <div className="h-32 min-h-0 overflow-hidden rounded-lg sm:h-36">
          <TimelineMedia item={items[0]} variant="gallery" fill className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid auto-rows-[6.5rem] grid-cols-2 gap-2 sm:auto-rows-[7.5rem] sm:grid-cols-3 sm:gap-2.5",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.src}
          className={cn(
            "min-h-0 min-w-0 overflow-hidden rounded-lg",
            index === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""
          )}
        >
          <TimelineMedia item={item} variant="gallery" fill className="h-full" />
        </div>
      ))}
    </div>
  );
}
