"use client";

import { useCallback, useEffect, useState } from "react";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { TimelineMedia } from "@/components/timeline/media/TimelineMedia";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LogPostPanel } from "./LogPostPanel";

type LogPostMediaCarouselProps = {
  items: TimelineMediaItem[];
};

export function LogPostMediaCarousel({ items }: LogPostMediaCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || paused || reducedMotion) return;
    const id = window.setInterval(next, 6000);
    return () => window.clearInterval(id);
  }, [items.length, paused, reducedMotion, next]);

  if (items.length === 0) return null;

  const item = items[index];

  return (
    <LogPostPanel contentClassName="!p-0">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="[&_figure]:rounded-none [&_div]:rounded-none [&_div]:border-0">
          <TimelineMedia item={item} variant="hero" />
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-white/5 px-6 py-4 sm:px-8">
            <div className="flex gap-2" role="tablist" aria-label="Media carousel">
              {items.map((entry, i) => (
                <button
                  key={entry.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show slide ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index
                      ? "carousel-indicator-active w-6"
                      : "w-1.5 bg-bg-subtle hover:bg-text-muted"
                  )}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {index + 1} / {items.length}
            </span>
          </div>
        )}
      </div>
    </LogPostPanel>
  );
}
