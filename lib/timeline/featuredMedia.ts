import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { extractYouTubeId, youTubeThumbnail } from "@/lib/admin/youtube";

export function getFeaturedMedia(media: TimelineMediaItem[]): TimelineMediaItem[] {
  return media.filter((item) => item.featured === true);
}

export function getSupplementaryMedia(media: TimelineMediaItem[]): TimelineMediaItem[] {
  return media.filter((item) => item.featured !== true);
}

/** Splits media for detail overlays: featured carousel + collage gallery. */
export function splitDetailMedia(media: TimelineMediaItem[]): {
  featured: TimelineMediaItem[];
  gallery: TimelineMediaItem[];
} {
  const featured = getFeaturedMedia(media);
  if (featured.length > 0) {
    return { featured, gallery: getSupplementaryMedia(media) };
  }

  const firstImage = media.find((item) => item.type === "image");
  if (firstImage) {
    return {
      featured: [firstImage],
      gallery: media.filter((item) => item.src !== firstImage.src),
    };
  }

  return { featured: [], gallery: media };
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
