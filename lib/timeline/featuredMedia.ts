import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { extractYouTubeId, youTubeThumbnail } from "@/lib/admin/youtube";

export function getFeaturedMedia(media: TimelineMediaItem[]): TimelineMediaItem[] {
  return media.filter((item) => item.featured === true);
}

/** Static preview image for timeline card thumbnails. */
export function getMediaPreviewSrc(item: TimelineMediaItem): string | null {
  if (item.type === "image") return item.src;
  if (item.type === "video" && item.poster) return item.poster;
  if (item.type === "youtube") {
    const id = extractYouTubeId(item.src);
    return id ? youTubeThumbnail(id) : null;
  }
  return null;
}

export function isPlayableMedia(item: TimelineMediaItem): boolean {
  return item.type === "video" || item.type === "youtube";
}
