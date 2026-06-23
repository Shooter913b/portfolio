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

function normalizeRelatedExperience(entry: RawTimelineEntry): RawTimelineEntry {
  if (entry.type !== "project") return entry;

  const relatedExperience = Array.isArray(entry.relatedExperience)
    ? entry.relatedExperience.filter(
        (id): id is string => typeof id === "string" && id.length > 0
      )
    : typeof entry.relatedExperience === "string" && entry.relatedExperience
      ? [entry.relatedExperience]
      : [];

  return { ...entry, relatedExperience };
}

function preprocessEntry(entry: RawTimelineEntry): RawTimelineEntry {
  const type = entry.type;
  if (type === "resume" || type === "skills") return entry;

  let next = normalizeRelatedExperience(entry);

  const thumbnail = next.thumbnail as LegacyThumbnail | undefined;
  if (!thumbnail?.src) return next;

  const media = Array.isArray(next.media)
    ? (next.media as TimelineMediaItem[])
    : [];

  const { thumbnail: _removed, ...rest } = next;
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
