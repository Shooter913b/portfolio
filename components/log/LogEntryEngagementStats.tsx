"use client";

import { useEffect, useState } from "react";
import { fetchPostEngagement } from "@/lib/log/engagementClient";
import { LogEngagementStats } from "./LogEngagementStats";

type LogEntryEngagementStatsProps = {
  slug: string;
  className?: string;
};

export function LogEntryEngagementStats({ slug, className }: LogEntryEngagementStatsProps) {
  const [views, setViews] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPostEngagement(slug)
      .then((data) => {
        setViews(data.views);
        setReactions(data.reactions);
      })
      .catch(() => {
        setViews(0);
        setReactions({});
      });
  }, [slug]);

  return (
    <LogEngagementStats
      views={views}
      reactions={reactions}
      className={className}
      compact
    />
  );
}
