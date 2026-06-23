"use client";

import { useCallback, useEffect, useState } from "react";
import { LOG_REACTIONS, type LogReaction } from "@/lib/log/engagement";
import {
  adjustPostReaction,
  fetchPostEngagement,
  getStoredReaction,
  hasRecordedView,
  markViewRecorded,
  recordPostView,
  setStoredReaction,
} from "@/lib/log/engagementClient";
import { trackLogPostView } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { LogEngagementStats } from "./LogEngagementStats";
import { LogPostPanel } from "./LogPostPanel";

type LogPostEngagementProps = {
  slug: string;
};

export function LogPostEngagement({ slug }: LogPostEngagementProps) {
  const [views, setViews] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchPostEngagement(slug);
      setViews(data.views);
      setReactions(data.reactions);
    } catch {
      setViews(0);
      setReactions({});
    }
  }, [slug]);

  useEffect(() => {
    setActiveReaction(getStoredReaction(slug));
    void load();
  }, [slug, load]);

  useEffect(() => {
    if (hasRecordedView(slug)) {
      trackLogPostView(slug);
      return;
    }

    void (async () => {
      try {
        const data = await recordPostView(slug);
        markViewRecorded(slug);
        setViews(data.views);
        setReactions(data.reactions);
      } catch {
        // Engagement API unavailable — still count in GoatCounter below.
      } finally {
        trackLogPostView(slug);
      }
    })();
  }, [slug]);

  const onReact = async (reaction: LogReaction) => {
    if (pending) return;
    setPending(true);

    const previous = getStoredReaction(slug);
    try {
      if (previous === reaction) {
        const data = await adjustPostReaction(slug, reaction, -1);
        setStoredReaction(slug, null);
        setActiveReaction(null);
        setViews(data.views);
        setReactions(data.reactions);
      } else {
        if (previous) {
          await adjustPostReaction(slug, previous, -1);
        }
        const data = await adjustPostReaction(slug, reaction, 1);
        setStoredReaction(slug, reaction);
        setActiveReaction(reaction);
        setViews(data.views);
        setReactions(data.reactions);
      }
    } catch {
      await load();
    } finally {
      setPending(false);
    }
  };

  return (
    <LogPostPanel label="Engagement">
      <div className="space-y-4">
        <LogEngagementStats views={views} reactions={reactions} />

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="React to this post">
          {LOG_REACTIONS.map((reaction) => {
            const count = reactions[reaction] ?? 0;
            const isActive = activeReaction === reaction;
            return (
              <button
                key={reaction}
                type="button"
                disabled={pending}
                onClick={() => void onReact(reaction)}
                aria-pressed={isActive}
                aria-label={`${reaction} reaction${count > 0 ? `, ${count}` : ""}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                  isActive
                    ? "border-accent-blue/50 bg-accent-blue/15 text-accent-blue"
                    : "border-white/10 bg-bg-subtle/50 text-text-primary hover:border-white/20"
                )}
              >
                <span aria-hidden>{reaction}</span>
                {count > 0 && (
                  <span className="font-mono text-[11px] text-text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </LogPostPanel>
  );
}
