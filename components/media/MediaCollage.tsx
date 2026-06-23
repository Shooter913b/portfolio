import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { collageGridClass, collageTileClass, type CollageSize } from "@/lib/media/collageLayout";
import { GalleryTile } from "@/components/media/GalleryTile";
import { cn } from "@/lib/cn";

type MediaCollageProps = {
  items: TimelineMediaItem[];
  className?: string;
  /** `compact` for timeline sidebars; `comfortable` for full-width sections. */
  size?: CollageSize;
  /** Omit the outer framed container — tiles sit directly on the page background. */
  bare?: boolean;
};

export function MediaCollage({
  items,
  className,
  size = "comfortable",
  bare = false,
}: MediaCollageProps) {
  if (items.length === 0) return null;

  const grid = (
    <div className={collageGridClass(size)}>
      {items.map((item, index) => (
        <GalleryTile
          key={`${item.src}-${index}`}
          item={item}
          priority={index === 0}
          className={collageTileClass(items.length, index, size)}
        />
      ))}
    </div>
  );

  if (bare) {
    return <div className={className}>{grid}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-bg-base/35 p-2.5 sm:p-3",
        className
      )}
    >
      {grid}
    </div>
  );
}
