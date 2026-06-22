import { z } from "zod";
import {
  timelineLinkSchema,
  timelineMediaItemSchema,
} from "./timeline-media";

export const blogFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  featured: z.boolean().optional().default(false),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  media: z.array(timelineMediaItemSchema).optional().default([]),
  links: z.array(timelineLinkSchema).optional().default([]),
  /** Timeline entry ids this post relates to (experience, education, or project). */
  relatedTimeline: z.array(z.string()).optional().default([]),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export type BlogPost = BlogFrontmatter & {
  slug: string;
  content: string;
};
