import { z } from "zod";

export const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  links: z.object({
    site: z.string().url(),
  }),
  resume: z.object({
    pdfPath: z.string(),
    lastUpdated: z.string(),
  }),
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export type Site = z.infer<typeof siteSchema>;
