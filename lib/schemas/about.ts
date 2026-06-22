import { z } from "zod";

const optionalUrl = z
  .string()
  .default("")
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Must be a valid URL or empty",
  });

const optionalText = z.string().default("");

export const aboutContactLinksSchema = z.object({
  linkedin: optionalUrl,
  github: optionalUrl,
  youtube: optionalText,
  discord: optionalText,
  twitter: optionalText,
  instagram: optionalUrl,
  tiktok: optionalUrl,
  threads: optionalUrl,
});

export type AboutContactLinks = z.infer<typeof aboutContactLinksSchema>;

export const aboutSchema = z.object({
  bio: z.array(z.string()).min(1),
  location: z.string().optional(),
  email: z
    .string()
    .default("")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Must be a valid email or empty",
    }),
  links: aboutContactLinksSchema,
});

export type About = z.infer<typeof aboutSchema>;
