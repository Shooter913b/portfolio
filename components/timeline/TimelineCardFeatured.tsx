"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import {
  getMediaPreviewSrc,
  isPlayableMedia,
} from "@/lib/timeline/featuredMedia";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type TimelineCardFeaturedProps = {
  items: TimelineMediaItem[];
  variant: "banner" | "inline" | "thumb";
  className?: string;
  compactControls?: boolean;
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
}: {
  item: TimelineMediaItem;
  variant: "banner" | "inline" | "thumb";
}) {
  const previewSrc = getMediaPreviewSrc(item);
  const playable = isPlayableMedia(item);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-bg-subtle",
        variant === "banner" && "aspect-[2/1] w-full",
        variant === "thumb" && "aspect-[5/3] w-full",
        variant === "inline" && "aspect-[5/3] w-full"
      )}
    >
      {previewSrc ? (
        <Image
          src={previewSrc}
          alt={item.alt ?? item.caption ?? ""}
          fill
          className="object-cover"
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
}: TimelineCardFeaturedProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1 || paused || reducedMotion) return;
    const id = window.setInterval(next, 5000);
    return () => window.clearInterval(id);
  }, [items.length, paused, reducedMotion, next]);

  if (items.length === 0) return null;

  const item = items[index];
  const showControls = items.length > 1;

  return (
    <div
      className={cn("group", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <FeaturedPreview item={item} variant={variant} />

      {showControls && (
        <div
          className={cn(
            compactControls ? "mt-1.5 flex justify-center" : "mt-2 flex items-center justify-between gap-2",
            variant === "inline" && "flex-col"
          )}
        >
          <div className="flex gap-1.5" role="tablist" aria-label="Featured media">
            {items.map((entry, i) => (
              <button
                key={`${entry.src}-${i}`}
                type="button"
                role="tab"
                data-carousel-control
                aria-selected={i === index}
                aria-label={`Show featured media ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "carousel-indicator-active w-5"
                    : "w-1.5 bg-bg-subtle hover:bg-text-muted"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>
          {variant === "banner" && !compactControls && (
            <span className="font-mono text-[10px] text-text-muted">
              {index + 1}/{items.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
