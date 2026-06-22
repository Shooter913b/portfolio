import type { BlogPost } from "@/lib/schemas/blog";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { getPostRelatedTimelineIds, postRelatesToTimelineEntry } from "@/lib/log/relatedTimeline";
import { isNarrativeEntry } from "@/lib/schemas/timeline";
import { getAllPosts } from "@/lib/content/getFeaturedPosts";
import { getTimeline } from "@/lib/content/getTimeline";

export type { PostTimelineRef } from "@/lib/log/timelineLabels";
export { getTimelineTypeLabel } from "@/lib/log/timelineLabels";
export { getPostRelatedTimelineIds, postRelatesToTimelineEntry } from "@/lib/log/relatedTimeline";

export function getNarrativeEntryById(id: string) {
  const entry = getTimeline().find((e) => e.id === id);
  return entry && isNarrativeEntry(entry) ? entry : undefined;
}

export function resolvePostTimelineRefs(post: BlogPost): PostTimelineRef[] {
  return getPostRelatedTimelineIds(post)
    .map((id) => {
      const entry = getNarrativeEntryById(id);
      if (!entry) return undefined;
      return { id: entry.id, title: entry.title, type: entry.type };
    })
    .filter((ref): ref is PostTimelineRef => Boolean(ref));
}

export function getPostsForTimelineEntry(timelineId: string): BlogPost[] {
  return getAllPosts().filter((post) => postRelatesToTimelineEntry(post, timelineId));
}

export function getTimelineEntriesWithPosts(): PostTimelineRef[] {
  const posts = getAllPosts();
  const ids = new Set(posts.flatMap((post) => getPostRelatedTimelineIds(post)));

  return [...ids]
    .map((id) => {
      const entry = getNarrativeEntryById(id);
      if (!entry) return undefined;
      return { id: entry.id, title: entry.title, type: entry.type };
    })
    .filter((ref): ref is PostTimelineRef => Boolean(ref))
    .sort((a, b) => a.title.localeCompare(b.title));
}
