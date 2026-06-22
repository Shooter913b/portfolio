import { z } from "zod";

export const timelineLinkSchema = z.object({
  label: z.string(),
  href: z.string().url(),
  icon: z.enum(["github", "external", "paper", "video", "site"]).optional(),
});

export const timelineMediaItemSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(["image", "video", "youtube"]),
  poster: z.string().optional(),
  /** When true, shown on the timeline card (carousel if multiple). */
  featured: z.boolean().optional(),
});

/** @deprecated Migrated into featured media items on read. */
export const timelineThumbnailSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

export type TimelineLink = z.infer<typeof timelineLinkSchema>;
export type TimelineMediaItem = z.infer<typeof timelineMediaItemSchema>;
export type TimelineThumbnail = z.infer<typeof timelineThumbnailSchema>;
