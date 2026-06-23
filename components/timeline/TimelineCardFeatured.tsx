"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { ImageLightbox } from "@/components/media/ImageLightbox";
import { MediaCarouselControls } from "@/components/media/MediaCarouselControls";
import {
  getMediaPreviewSrc,
  isPlayableMedia,
} from "@/lib/timeline/featuredMedia";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AUTO_INTERVAL_MS = 5000;

type TimelineCardFeaturedProps = {
  items: TimelineMediaItem[];
  variant: "banner" | "inline" | "thumb";
  className?: string;
  compactControls?: boolean;
  /** When set, autoplay and index state are managed by the parent. */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Autoplay when uncontrolled. Ignored when `activeIndex` is provided. */
  autoPlay?: boolean;
  /** Slide duration for progress indicators (ms). */
  intervalMs?: number;
  /** Show animated progress on the active dot. */
  showAutoProgress?: boolean;
};

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-xs text-white">
        ▶
      </span>
    </div>
  );
}

function FeaturedPreview({
  item,
  variant,
  onExpandImage,
}: {
  item: TimelineMediaItem;
  variant: "banner" | "inline" | "thumb";
  onExpandImage?: () => void;
}) {
  const previewSrc = getMediaPreviewSrc(item);
  const playable = isPlayableMedia(item);
  const expandable = item.type === "image" && Boolean(onExpandImage);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-bg-subtle",
        variant === "banner" && "aspect-[2/1] w-full",
        variant === "thumb" && "aspect-[5/3] w-full",
        variant === "inline" && "aspect-[5/3] w-full",
        expandable && "cursor-zoom-in"
      )}
      data-media-expand={expandable ? "" : undefined}
      onClick={(event) => {
        if (!expandable) return;
        event.stopPropagation();
        onExpandImage?.();
      }}
      onKeyDown={(event) => {
        if (!expandable) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        onExpandImage?.();
      }}
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-label={
        expandable
          ? `View full image: ${item.alt ?? item.caption ?? "featured image"}`
          : undefined
      }
    >
      {previewSrc ? (
        <Image
          src={previewSrc}
          alt={item.alt ?? item.caption ?? ""}
          fill
          className="object-contain"
          sizes={
            variant === "inline"
              ? "(max-width: 1024px) 100vw, 224px"
              : "(max-width: 768px) 100vw, 320px"
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-bg-subtle font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {item.type}
        </div>
      )}
      {playable && <PlayOverlay />}
    </div>
  );
}

export function TimelineCardFeatured({
  items,
  variant,
  className,
  compactControls = false,
  activeIndex,
  onActiveIndexChange,
  autoPlay = true,
  intervalMs = AUTO_INTERVAL_MS,
  showAutoProgress,
}: TimelineCardFeaturedProps) {
  const reducedMotion = useReducedMotion();
  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isControlled = activeIndex !== undefined;
  const index = isControlled ? activeIndex : internalIndex;

  const setIndex = useCallback(
    (next: number | ((current: number) => number)) => {
      const apply = (current: number) => {
        const resolved = typeof next === "function" ? next(current) : next;
        return items.length > 0
          ? ((resolved % items.length) + items.length) % items.length
          : 0;
      };

      if (isControlled) {
        onActiveIndexChange?.(apply(activeIndex ?? 0));
      } else {
        setInternalIndex((current) => apply(current));
      }
    },
    [activeIndex, isControlled, items.length, onActiveIndexChange]
  );

  const next = useCallback(() => {
    setIndex((current) => current + 1);
  }, [setIndex]);

  useEffect(() => {
    if (!isControlled) {
      setInternalIndex(0);
    }
  }, [items, isControlled]);

  useEffect(() => {
    if (isControlled || !autoPlay || items.length <= 1 || paused || reducedMotion) return;
    const id = window.setInterval(next, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isControlled, autoPlay, items.length, paused, reducedMotion, next]);

  const safeIndex =
    items.length > 0 ? ((index % items.length) + items.length) % items.length : 0;

  useEffect(() => {
    if (isControlled && items.length > 0 && safeIndex !== activeIndex) {
      onActiveIndexChange?.(safeIndex);
    }
  }, [isControlled, items.length, safeIndex, activeIndex, onActiveIndexChange]);

  if (items.length === 0) return null;

  const item = items[safeIndex];
  const showControls = items.length > 1;
  const lightboxSrc = item.type === "image" ? item.src : null;
  const progressEnabled =
    showAutoProgress ?? (!isControlled && autoPlay && !paused && !reducedMotion);

  return (
    <div className={cn("group", className)}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <FeaturedPreview
          item={item}
          variant={variant}
          onExpandImage={lightboxSrc ? () => setLightboxOpen(true) : undefined}
        />
      </div>

      {showControls && (
        <MediaCarouselControls
          count={items.length}
          index={safeIndex}
          onIndexChange={setIndex}
          compact={compactControls}
          showCounter={variant === "banner" && !compactControls}
          label="Featured media"
          autoPlay={progressEnabled}
          intervalMs={intervalMs}
          className={cn(
            compactControls ? "mt-1.5" : "mt-2 px-4 pb-3",
            variant === "inline" && "w-full"
          )}
        />
      )}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={item.alt}
          caption={item.caption}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
