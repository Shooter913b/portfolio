import type { BlogPost } from "@/lib/schemas/blog";

export function getPostRelatedTimelineIds(
  post: Pick<BlogPost, "relatedTimeline">
): string[] {
  return post.relatedTimeline ?? [];
}

export function postRelatesToTimelineEntry(
  post: Pick<BlogPost, "relatedTimeline">,
  timelineId: string
): boolean {
  return getPostRelatedTimelineIds(post).includes(timelineId);
}
