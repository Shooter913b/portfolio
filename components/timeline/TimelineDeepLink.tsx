"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTimelineOverlay, type TimelineCardSide } from "./TimelineOverlayContext";

type TimelineDeepLinkProps = {
  entries: NarrativeEntry[];
};

function getEntryIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("entry");
}

function openTimelineEntry(
  entryId: string,
  openOverlay: ReturnType<typeof useTimelineOverlay>["openOverlay"],
  reducedMotion: boolean
) {
  let attempts = 0;
  const maxAttempts = 40;

  const attempt = () => {
    const root = document.querySelector(`[data-timeline-entry="${entryId}"]`);
    if (!root) {
      if (attempts < maxAttempts) {
        attempts += 1;
        window.setTimeout(attempt, 50);
        return;
      }
      openOverlay(entryId, "left", null);
      return;
    }

    root.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
    });

    const card = root.querySelector("[data-timeline-card]");
    const side =
      (card?.getAttribute("data-timeline-side") as TimelineCardSide | null) ??
      "left";
    const rect = card?.getBoundingClientRect() ?? null;

    window.setTimeout(
      () => openOverlay(entryId, side, rect),
      reducedMotion ? 0 : 350
    );
  };

  attempt();
}

function TimelineDeepLinkInner({ entries }: TimelineDeepLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openOverlay } = useTimelineOverlay();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (pathname !== "/") return;

    const entryId =
      searchParams.get("entry") ?? getEntryIdFromUrl();
    if (!entryId || !entries.some((entry) => entry.id === entryId)) return;

    const delay = reducedMotion ? 0 : 80;
    const id = window.setTimeout(
      () => openTimelineEntry(entryId, openOverlay, reducedMotion),
      delay
    );

    return () => window.clearTimeout(id);
  }, [entries, openOverlay, pathname, reducedMotion, searchParams]);

  return null;
}

export function TimelineDeepLink(props: TimelineDeepLinkProps) {
  return (
    <Suspense fallback={null}>
      <TimelineDeepLinkInner {...props} />
    </Suspense>
  );
}
