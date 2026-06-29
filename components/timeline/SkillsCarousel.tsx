"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SkillCategory } from "@/lib/schemas/skills";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAutoplayActive } from "@/hooks/useAutoplayActive";
import { Button } from "@/components/ui/Button";
import { SkillCategoryPanel } from "./SkillCategoryPanel";

const AUTO_MS = 5500;

type SkillsCarouselProps = {
  categories: SkillCategory[];
  isLeft: boolean;
  entryId: string;
};

export function SkillsCarousel({
  categories,
  isLeft,
  entryId,
}: SkillsCarouselProps) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const { ref: rootRef, active: onScreen } = useAutoplayActive<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [panelHeight, setPanelHeight] = useState<number | undefined>();
  const reducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      setAutoPlay(false);
      setIndex((next + categories.length) % categories.length);
    },
    [categories.length]
  );

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % categories.length);
  }, [categories.length]);

  // Size the panel area to the tallest category so nothing is clipped.
  useEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;

    const measureAll = () => {
      const panels = measure.querySelectorAll<HTMLElement>("[data-measure-panel]");
      let max = 0;
      panels.forEach((panel) => {
        max = Math.max(max, panel.offsetHeight);
      });
      if (max > 0) setPanelHeight(max);
    };

    measureAll();
    window.addEventListener("resize", measureAll, { passive: true });
    return () => window.removeEventListener("resize", measureAll);
  }, [categories]);

  useEffect(() => {
    if (categories.length <= 1 || !autoPlay || reducedMotion || !onScreen) return;
    const id = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(id);
  }, [categories.length, autoPlay, reducedMotion, onScreen, next]);

  return (
    <div ref={rootRef} data-timeline-entry={entryId} className="relative">
      <div
        data-timeline-dot
        className="timeline-dot absolute left-1/2 top-8 hidden h-3 w-3 rounded-full ring-4 ring-bg-base md:block"
        aria-hidden
      />

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
        <div
          data-timeline-card
          data-timeline-side={isLeft ? "left" : "right"}
          className={cn(
            "rounded-xl border border-white/5 bg-bg-elevated p-6 opacity-90 transition-all duration-300 hover:border-white/10 hover-accent-glow-sm hover:opacity-100",
            isLeft ? "md:col-start-1" : "md:col-start-2"
          )}
        >
          <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
            Skills
          </p>

          <div
            ref={measureRef}
            className="pointer-events-none invisible absolute h-0 overflow-hidden"
            aria-hidden
          >
            {categories.map((cat) => (
              <div key={cat.id} data-measure-panel>
                <SkillCategoryPanel category={cat} />
              </div>
            ))}
          </div>

          <div
            className="relative mt-6"
            style={panelHeight ? { minHeight: panelHeight } : undefined}
            aria-live="polite"
            aria-atomic="true"
          >
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className={cn(
                  "transition-opacity duration-300 ease-out",
                  reducedMotion ? (i === index ? "block" : "hidden") : "",
                  !reducedMotion &&
                    (i === index
                      ? "opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0")
                )}
                aria-hidden={i !== index}
              >
                <SkillCategoryPanel category={cat} />
              </div>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-text-muted">
                {categories[index]?.label} · {index + 1}/{categories.length}
                {autoPlay && !reducedMotion && (
                  <span className="text-text-muted/60">
                    {" "}
                    · next{" "}
                    {categories[(index + 1) % categories.length]?.label}
                  </span>
                )}
              </p>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 px-0"
                  aria-label="Previous skill category"
                  onClick={() => goTo(index - 1)}
                >
                  ←
                </Button>
                <div className="flex gap-1.5 px-1" role="tablist" aria-label="Skill categories">
                  {categories.map((cat, i) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={cat.label}
                      className={cn(
                        "relative h-1.5 overflow-hidden rounded-full bg-bg-subtle transition-all duration-300",
                        i === index ? "w-8" : "w-1.5 hover:bg-text-muted"
                      )}
                      onClick={() => goTo(i)}
                    >
                      {i === index && (
                        <>
                          <span
                            className={cn(
                              "absolute inset-0 rounded-full",
                              autoPlay && !reducedMotion && onScreen
                                ? "carousel-indicator-active opacity-25"
                                : "carousel-indicator-active"
                            )}
                            aria-hidden
                          />
                          {autoPlay && !reducedMotion && onScreen && (
                            <span
                              key={`progress-${index}`}
                              className="carousel-indicator-active carousel-auto-progress absolute inset-0 rounded-full"
                              style={{ animationDuration: `${AUTO_MS}ms` }}
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
                  className="h-8 w-8 px-0"
                  aria-label="Next skill category"
                  onClick={() => goTo(index + 1)}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
