import Image from "next/image";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
import { cn } from "@/lib/cn";

type TimelineMediaProps = {
  item: TimelineMediaItem;
  variant?: "hero" | "gallery" | "stack";
  /** Fill the parent's height instead of using the variant aspect ratio. */
  fill?: boolean;
  className?: string;
};

export function TimelineMedia({
  item,
  variant = "stack",
  fill = false,
  className,
}: TimelineMediaProps) {
  const aspect = fill
    ? "h-full"
    : variant === "hero"
      ? "aspect-video"
      : variant === "gallery"
        ? "aspect-[4/3]"
        : "aspect-video";

  return (
    <figure className={cn("group", className)}>
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-xl border border-white/10 bg-bg-subtle ring-1 ring-white/5 transition-all duration-300 group-hover:border-accent-blue/30 group-hover:ring-accent-blue/20",
          aspect
        )}
      >
        {item.type === "youtube" ? (
          <YouTubeEmbed src={item.src} title={item.alt ?? item.caption ?? "YouTube video"} />
        ) : item.type === "video" ? (
          <video
            src={item.src}
            poster={item.poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={item.src}
            alt={item.alt ?? ""}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes={
              variant === "hero"
                ? "(max-width: 768px) 100vw, 896px"
                : "(max-width: 768px) 50vw, 320px"
            }
          />
        )}
      </div>
      {item.caption && (
        <figcaption className="mt-2 text-center text-xs text-text-muted">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function hasTimelineMedia(items: TimelineMediaItem[]): boolean {
  return items.length > 0;
}
