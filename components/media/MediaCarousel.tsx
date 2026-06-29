"use client";

import { useCallback, useEffect, useState } from "react";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { MediaCarouselControls } from "@/components/media/MediaCarouselControls";
import { TimelineMedia } from "@/components/timeline/media/TimelineMedia";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAutoplayActive } from "@/hooks/useAutoplayActive";

const AUTO_INTERVAL_MS = 6000;

type MediaCarouselProps = {
  items: TimelineMediaItem[];
  className?: string;
  controlsClassName?: string;
  label?: string;
};

export function MediaCarousel({
  items,
  className,
  controlsClassName,
  label = "Media carousel",
}: MediaCarouselProps) {
  const reducedMotion = useReducedMotion();
  const { ref: rootRef, active: onScreen } = useAutoplayActive<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1 || paused || reducedMotion || !onScreen) return;
    const id = window.setInterval(next, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [items.length, paused, reducedMotion, onScreen, next]);

  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className={className}>
        <TimelineMedia item={items[0]} variant="hero" />
      </div>
    );
  }

  const item = items[index];

  return (
    <div
      ref={rootRef}
      className={cn("overflow-hidden rounded-xl border border-white/10 bg-bg-subtle", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TimelineMedia item={item} variant="hero" />

      <div className={cn("border-t border-white/5 px-5 py-4 sm:px-6", controlsClassName)}>
        <MediaCarouselControls
          count={items.length}
          index={index}
          onIndexChange={setIndex}
          showCounter
          label={label}
          autoPlay={!paused && !reducedMotion && onScreen}
          intervalMs={AUTO_INTERVAL_MS}
        />
      </div>
    </div>
  );
}
