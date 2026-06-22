import type { BlogPost } from "@/lib/schemas/blog";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { isNarrativeEntry } from "@/lib/schemas/timeline";
import { getAllPosts } from "@/lib/content/getFeaturedPosts";
import { getTimeline } from "@/lib/content/getTimeline";

export type { PostTimelineRef } from "@/lib/log/timelineLabels";
export { getTimelineTypeLabel } from "@/lib/log/timelineLabels";

export function getNarrativeEntryById(id: string) {
  const entry = getTimeline().find((e) => e.id === id);
  return entry && isNarrativeEntry(entry) ? entry : undefined;
}

export function resolvePostTimelineRef(
  post: BlogPost
): PostTimelineRef | undefined {
  if (!post.relatedTimeline) return undefined;

  const entry = getNarrativeEntryById(post.relatedTimeline);
  if (!entry) return undefined;

  return {
    id: entry.id,
    title: entry.title,
    type: entry.type,
  };
}

export function getPostsForTimelineEntry(timelineId: string): BlogPost[] {
  return getAllPosts().filter((post) => post.relatedTimeline === timelineId);
}

export function getTimelineEntriesWithPosts(): PostTimelineRef[] {
  const posts = getAllPosts();
  const ids = new Set(
    posts
      .map((post) => post.relatedTimeline)
      .filter((id): id is string => Boolean(id))
  );

  return [...ids]
    .map((id) => {
      const entry = getNarrativeEntryById(id);
      if (!entry) return undefined;
      return { id: entry.id, title: entry.title, type: entry.type };
    })
    .filter((ref): ref is PostTimelineRef => Boolean(ref))
    .sort((a, b) => a.title.localeCompare(b.title));
}
