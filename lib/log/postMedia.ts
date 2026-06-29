import type { BlogPost } from "@/lib/schemas/blog";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";

export function getFeaturedPostMedia(post: BlogPost): TimelineMediaItem[] {
  return post.media.filter((item) => item.featured === true);
}

export function getSupplementaryPostMedia(post: BlogPost): TimelineMediaItem[] {
  return post.media.filter((item) => item.featured !== true);
}

export function hasPostMedia(post: BlogPost): boolean {
  return getFeaturedPostMedia(post).length > 0;
}
