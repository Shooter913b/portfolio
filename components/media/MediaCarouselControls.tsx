"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type MediaCarouselControlsProps = {
  count: number;
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
  compact?: boolean;
  showCounter?: boolean;
  label?: string;
  autoPlay?: boolean;
  intervalMs?: number;
};

function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

export function MediaCarouselControls({
  count,
  index,
  onIndexChange,
  className,
  compact = false,
  showCounter = false,
  label = "Media carousel",
  autoPlay = false,
  intervalMs = 5000,
}: MediaCarouselControlsProps) {
  const reducedMotion = useReducedMotion();

  if (count <= 1) return null;

  const goTo = (next: number) => onIndexChange(wrapIndex(next, count));
  const showProgress = autoPlay && !reducedMotion;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-[1fr_auto_1fr] items-center",
        className
      )}
    >
      <div aria-hidden />

      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="ghost"
          className={cn("shrink-0 px-0", compact ? "h-7 w-7" : "h-8 w-8")}
          aria-label="Previous slide"
          data-carousel-control
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            goTo(index - 1);
          }}
        >
          ←
        </Button>

        <div className="flex gap-1.5 px-1" role="tablist" aria-label={label}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              data-carousel-control
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              className={cn(
                "relative h-1.5 overflow-hidden rounded-full transition-all duration-300",
                i === index ? "w-8" : "w-1.5 bg-bg-subtle hover:bg-text-muted"
              )}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                goTo(i);
              }}
            >
              {i === index && (
                <>
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full",
                      showProgress
                        ? "carousel-indicator-active opacity-25"
                        : "carousel-indicator-active"
                    )}
                    aria-hidden
                  />
                  {showProgress && (
                    <span
                      key={`progress-${index}`}
                      className="carousel-indicator-active carousel-auto-progress absolute inset-0 rounded-full"
                      style={{ animationDuration: `${intervalMs}ms` }}
                      aria-hidden
                    />
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          className={cn("shrink-0 px-0", compact ? "h-7 w-7" : "h-8 w-8")}
          aria-label="Next slide"
          data-carousel-control
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            goTo(index + 1);
          }}
        >
          →
        </Button>
      </div>

      <div className="flex justify-end">
        {showCounter && (
          <span className="pr-1 font-mono text-[10px] tabular-nums text-text-muted">
            {index + 1}/{count}
          </span>
        )}
      </div>
    </div>
  );
}

export function wrapCarouselIndex(index: number, count: number): number {
  return wrapIndex(index, count);
}
