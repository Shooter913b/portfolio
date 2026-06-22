import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { extractYouTubeId } from "@/lib/admin/youtube";

type RawFrontmatter = Record<string, unknown>;

function pushMedia(
  media: TimelineMediaItem[],
  item: TimelineMediaItem
): TimelineMediaItem[] {
  const index = media.findIndex((entry) => entry.src === item.src);
  if (index >= 0) {
    const next = [...media];
    next[index] = { ...next[index], ...item, featured: next[index].featured || item.featured };
    return next;
  }
  return [...media, item];
}

/** Merges legacy cover, carousel, and gallery fields into `media`. */
export function preprocessPostFrontmatter(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const data = raw as RawFrontmatter;
  let media: TimelineMediaItem[] = Array.isArray(data.media)
    ? [...(data.media as TimelineMediaItem[])]
    : [];

  for (const item of (data.carousel as TimelineMediaItem[] | undefined) ?? []) {
    media = pushMedia(media, { ...item, featured: item.featured ?? true });
  }

  for (const item of (data.gallery as { src: string; alt?: string; caption?: string }[] | undefined) ?? []) {
    media = pushMedia(media, {
      type: "image",
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      featured: false,
    });
  }

  if (typeof data.image === "string" && data.image) {
    media = pushMedia(media, {
      type: "image",
      src: data.image,
      alt: typeof data.imageAlt === "string" ? data.imageAlt : undefined,
      featured: true,
    });
  }

  if (typeof data.video === "string" && data.video) {
    const isYouTube = Boolean(extractYouTubeId(data.video));
    media = pushMedia(media, {
      type: isYouTube ? "youtube" : "video",
      src: data.video,
      poster:
        typeof data.videoPoster === "string"
          ? data.videoPoster
          : typeof data.image === "string"
            ? data.image
            : undefined,
      alt: typeof data.imageAlt === "string" ? data.imageAlt : undefined,
      featured: true,
    });
  }

  const {
    image: _image,
    imageAlt: _imageAlt,
    video: _video,
    videoPoster: _videoPoster,
    carousel: _carousel,
    gallery: _gallery,
    ...rest
  } = data;

  const relatedTimeline = Array.isArray(data.relatedTimeline)
    ? data.relatedTimeline.filter((id): id is string => typeof id === "string" && id.length > 0)
    : typeof data.relatedTimeline === "string" && data.relatedTimeline
      ? [data.relatedTimeline]
      : [];

  return { ...rest, media, relatedTimeline };
}
