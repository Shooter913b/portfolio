import type { BlogPost } from "@/lib/schemas/blog";
import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { getFeaturedPostMedia } from "@/lib/log/postMedia";
import { TimelineMedia } from "@/components/timeline/media/TimelineMedia";
import { LogPostMediaCarousel } from "@/components/log/LogPostMediaCarousel";

type PostFeaturedMediaProps = {
  post: BlogPost;
  className?: string;
};

export function PostFeaturedMedia({ post, className }: PostFeaturedMediaProps) {
  const items = getFeaturedPostMedia(post);
  if (items.length === 0) return null;
  if (items.length === 1) {
    return <TimelineMedia item={items[0]} variant="hero" className={className} />;
  }
  return <LogPostMediaCarousel items={items} />;
}

export function hasPostMedia(post: BlogPost): boolean {
  return getFeaturedPostMedia(post).length > 0;
}

export type { TimelineMediaItem };
