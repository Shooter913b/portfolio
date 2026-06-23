"use client";

import { useState } from "react";
import Image from "next/image";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
import {
  getMediaPreviewSrc,
} from "@/lib/timeline/featuredMedia";
import { cn } from "@/lib/cn";

type GalleryTileProps = {
  item: TimelineMediaItem;
  className?: string;
  priority?: boolean;
};

function PlayBadge() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-sm text-white backdrop-blur-sm">
        ▶
      </span>
    </div>
  );
}

export function GalleryTile({ item, className, priority = false }: GalleryTileProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoActive, setVideoActive] = useState(false);

  const isImage = item.type === "image";
  const previewSrc = getMediaPreviewSrc(item);
  const label = item.alt ?? item.caption ?? "Gallery media";

  const openImage = () => {
    if (!isImage) return;
    setLightboxOpen(true);
  };

  const activateVideo = () => {
    if (item.type === "video") setVideoActive(true);
  };

  return (
    <>
      <figure
        className={cn(
          "group/tile relative h-full min-h-0 w-full overflow-hidden rounded-xl",
          "border border-white/8 bg-bg-subtle ring-1 ring-white/5",
          "transition-[border-color,box-shadow,transform] duration-300",
          "hover:border-accent-blue/30 hover:ring-accent-blue/15 hover:shadow-[0_12px_32px_-20px_rgb(0_212_255/0.45)]",
          className
        )}
      >
        <div
          className={cn(
            "relative h-full w-full min-h-[inherit]",
            isImage && "cursor-zoom-in",
            item.type === "video" && !videoActive && "cursor-pointer"
          )}
          data-media-expand={isImage ? "" : undefined}
          onClick={(event) => {
            if (!isImage) return;
            event.stopPropagation();
            openImage();
          }}
          onKeyDown={(event) => {
            if (!isImage) return;
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            openImage();
          }}
          role={isImage ? "button" : undefined}
          tabIndex={isImage ? 0 : undefined}
          aria-label={isImage ? `View full image: ${label}` : undefined}
        >
          {item.type === "youtube" ? (
            <YouTubeEmbed
              src={item.src}
              title={label}
              className="absolute inset-0 h-full w-full"
            />
          ) : item.type === "video" && videoActive ? (
            <video
              src={item.src}
              poster={item.poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
              onClick={(event) => event.stopPropagation()}
            />
          ) : previewSrc ? (
            <Image
              src={previewSrc}
              alt={item.alt ?? ""}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.04]"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            />
          ) : (
            <div className="flex h-full min-h-[inherit] w-full items-center justify-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {item.type}
            </div>
          )}

          {item.type === "video" && !videoActive && (
            <button
              type="button"
              className="absolute inset-0 z-10"
              aria-label={`Play ${label}`}
              onClick={(event) => {
                event.stopPropagation();
                activateVideo();
              }}
            >
              <PlayBadge />
            </button>
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
            aria-hidden
          />

          {item.caption && (
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 py-2.5 text-left text-[11px] leading-snug text-white/90 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100">
              {item.caption}
            </figcaption>
          )}
        </div>
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
