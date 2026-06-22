import type { BlogPost } from "@/lib/schemas/blog";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";

export function getFeaturedPostMedia(post: BlogPost): TimelineMediaItem[] {
  return post.media.filter((item) => item.featured === true);
}

export function getSupplementaryPostMedia(post: BlogPost): TimelineMediaItem[] {
  return post.media.filter((item) => item.featured !== true);
}

/** @deprecated Use getFeaturedPostMedia */
export function getPostCarouselItems(post: BlogPost): TimelineMediaItem[] {
  return getFeaturedPostMedia(post);
}

/** @deprecated Use getSupplementaryPostMedia */
export function getSupplementaryGalleryItems(post: BlogPost): TimelineMediaItem[] {
  return getSupplementaryPostMedia(post).filter((item) => item.type === "image");
}

export function hasPostMedia(post: BlogPost): boolean {
  return getFeaturedPostMedia(post).length > 0;
}
