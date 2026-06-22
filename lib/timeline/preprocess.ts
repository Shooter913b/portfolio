import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";

type LegacyThumbnail = {
  src: string;
  alt?: string;
};

type RawTimelineEntry = Record<string, unknown>;

function migrateThumbnailToFeatured(
  media: TimelineMediaItem[],
  thumbnail: LegacyThumbnail
): TimelineMediaItem[] {
  const nextMedia = [...media];
  const existingIndex = nextMedia.findIndex((item) => item.src === thumbnail.src);

  if (existingIndex >= 0) {
    nextMedia[existingIndex] = { ...nextMedia[existingIndex], featured: true };
  } else {
    nextMedia.unshift({
      type: "image",
      src: thumbnail.src,
      alt: thumbnail.alt,
      featured: true,
    });
  }

  return nextMedia;
}

function preprocessEntry(entry: RawTimelineEntry): RawTimelineEntry {
  const type = entry.type;
  if (type === "resume" || type === "skills") return entry;

  const thumbnail = entry.thumbnail as LegacyThumbnail | undefined;
  if (!thumbnail?.src) return entry;

  const media = Array.isArray(entry.media)
    ? (entry.media as TimelineMediaItem[])
    : [];

  const { thumbnail: _removed, ...rest } = entry;
  return {
    ...rest,
    media: migrateThumbnailToFeatured(media, thumbnail),
  };
}

/** Migrates legacy `thumbnail` fields to `media[].featured` before Zod parsing. */
export function preprocessTimelineData(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const data = raw as { entries?: unknown[] };
  if (!Array.isArray(data.entries)) return raw;

  return {
    ...data,
    entries: data.entries.map((entry) =>
      entry && typeof entry === "object"
        ? preprocessEntry(entry as RawTimelineEntry)
        : entry
    ),
  };
}
