import { z } from "zod";

export const profileSchema = z.object({
  photo: z.object({
    src: z.string().nullable(),
    alt: z.string(),
    placeholderInitials: z.string(),
  }),
});

export type Profile = z.infer<typeof profileSchema>;
