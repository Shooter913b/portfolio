"use client";

import { useSearchParams } from "next/navigation";
import type { BlogPost } from "@/lib/schemas/blog";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { FlightLogBoard } from "./FlightLogBoard";
import { LogFilterDropdown } from "./LogFilterDropdown";

type LogIndexClientProps = {
  posts: BlogPost[];
  filterOptions: PostTimelineRef[];
};

export function LogIndexClient({ posts, filterOptions }: LogIndexClientProps) {
  const searchParams = useSearchParams();
  const relatedId = searchParams.get("related");
  const activeFilter = filterOptions.find((option) => option.id === relatedId);

  const filteredPosts = relatedId
    ? posts.filter((post) => post.relatedTimeline === relatedId)
    : posts;

  return (
    <FlightLogBoard
      posts={filteredPosts}
      emptyMessage={
        activeFilter
          ? `No logs linked to ${activeFilter.title} yet.`
          : undefined
      }
      headerAside={
        <LogFilterDropdown filterOptions={filterOptions} activeId={relatedId} />
      }
    />
  );
}
