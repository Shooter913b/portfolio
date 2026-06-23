"use client";

import { useState } from "react";
import Image from "next/image";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { cn } from "@/lib/cn";

type TimelineMediaProps = {
  item: TimelineMediaItem;
  variant?: "hero" | "gallery" | "stack";
  /** Fill the parent's height instead of using the variant aspect ratio. */
  fill?: boolean;
  className?: string;
};

function imageMaxHeight(variant: "hero" | "gallery" | "stack") {
  switch (variant) {
    case "hero":
      return "max-h-[min(70vh,720px)]";
    case "gallery":
      return "max-h-48";
    default:
      return "max-h-[min(65vh,640px)]";
  }
}

export function TimelineMedia({
  item,
  variant = "stack",
  fill = false,
  className,
}: TimelineMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isImage = item.type === "image";

  const frameClass = fill
    ? "relative h-full w-full min-h-0"
    : cn(
        "relative flex w-full items-center justify-center",
        isImage ? cn("min-h-[10rem]", imageMaxHeight(variant)) : "aspect-video w-full"
      );

  const openLightbox = (event: React.MouseEvent) => {
    if (!isImage) return;
    event.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
      <figure className={cn("group w-full", className)}>
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-white/10 bg-bg-subtle ring-1 ring-white/5 transition-all duration-300 group-hover:border-accent-blue/30 group-hover:ring-accent-blue/20",
            frameClass,
            isImage && "cursor-zoom-in"
          )}
          data-media-expand={isImage ? "" : undefined}
          onClick={openLightbox}
          onKeyDown={(event) => {
            if (!isImage) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            setLightboxOpen(true);
          }}
          role={isImage ? "button" : undefined}
          tabIndex={isImage ? 0 : undefined}
          aria-label={isImage ? `View full image: ${item.alt ?? item.caption ?? "image"}` : undefined}
        >
          {item.type === "youtube" ? (
            <YouTubeEmbed
              src={item.src}
              title={item.alt ?? item.caption ?? "YouTube video"}
              className="absolute inset-0 h-full w-full"
            />
          ) : item.type === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          ) : fill ? (
            <Image
              src={item.src}
              alt={item.alt ?? ""}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 50vw, 320px"
            />
          ) : (
            <Image
              src={item.src}
              alt={item.alt ?? ""}
              width={1600}
              height={900}
              className={cn("h-auto w-full object-contain", imageMaxHeight(variant))}
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

      {isImage && (
        <ImageLightbox
          src={item.src}
          alt={item.alt}
          caption={item.caption}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

export function hasTimelineMedia(items: TimelineMediaItem[]): boolean {
  return items.length > 0;
}
