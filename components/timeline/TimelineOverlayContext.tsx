"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BlogPost } from "@/lib/schemas/blog";
import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { postRelatesToTimelineEntry } from "@/lib/log/relatedTimeline";
import { TimelineDetailOverlay } from "./TimelineDetailOverlay";
import { TimelineDeepLink } from "./TimelineDeepLink";

export type TimelineCardSide = "left" | "right";

type TimelineOverlayContextValue = {
  openOverlay: (
    id: string,
    side?: TimelineCardSide,
    originRect?: DOMRect | null
  ) => void;
  closeOverlay: () => void;
};

const TimelineOverlayContext = createContext<TimelineOverlayContextValue | null>(
  null
);

export function useTimelineOverlay() {
  const ctx = useContext(TimelineOverlayContext);
  if (!ctx) {
    throw new Error("useTimelineOverlay must be used within TimelineOverlayProvider");
  }
  return ctx;
}

type OverlayState = {
  id: string;
  side: TimelineCardSide;
  originRect: DOMRect | null;
};

type TimelineOverlayProviderProps = {
  entries: NarrativeEntry[];
  posts: BlogPost[];
  children: ReactNode;
};

export function TimelineOverlayProvider({
  entries,
  posts,
  children,
}: TimelineOverlayProviderProps) {
  const [open, setOpen] = useState<OverlayState | null>(null);

  const openOverlay = useCallback(
    (
      id: string,
      side: TimelineCardSide = "left",
      originRect: DOMRect | null = null
    ) => {
      setOpen({ id, side, originRect });
    },
    []
  );

  const closeOverlay = useCallback(() => {
    setOpen(null);
  }, []);

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === open?.id) ?? null,
    [entries, open?.id]
  );

  const relatedPosts = useMemo(() => {
    if (!activeEntry) return [];
    return posts.filter((post) => postRelatesToTimelineEntry(post, activeEntry.id));
  }, [activeEntry, posts]);

  const value = useMemo(
    () => ({ openOverlay, closeOverlay }),
    [openOverlay, closeOverlay]
  );

  return (
    <TimelineOverlayContext.Provider value={value}>
      {children}
      <TimelineDeepLink entries={entries} />
      {activeEntry && open && (
        <TimelineDetailOverlay
          entry={activeEntry}
          side={open.side}
          originRect={open.originRect}
          relatedPosts={relatedPosts}
          onClose={closeOverlay}
        />
      )}
    </TimelineOverlayContext.Provider>
  );
}
