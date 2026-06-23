import { z } from "zod";
import {
  timelineLinkSchema,
  timelineMediaItemSchema,
} from "./timeline-media";

const baseEntry = z.object({
  id: z.string(),
  order: z.number(),
  visible: z.boolean(),
});

export const resumeEntrySchema = baseEntry.extend({
  type: z.literal("resume"),
});

export const skillsEntrySchema = baseEntry.extend({
  type: z.literal("skills"),
});

const narrativeEntrySchema = baseEntry.extend({
  type: z.enum(["experience", "education", "project"]),
  title: z.string(),
  subtitle: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  summary: z.string(),
  body: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  media: z.array(timelineMediaItemSchema).default([]),
  links: z.array(timelineLinkSchema).default([]),
});

export const experienceEntrySchema = narrativeEntrySchema.extend({
  type: z.literal("experience"),
});

export const educationEntrySchema = narrativeEntrySchema.extend({
  type: z.literal("education"),
});

export const projectEntrySchema = narrativeEntrySchema.extend({
  type: z.literal("project"),
  relatedExperience: z.array(z.string()).optional().default([]),
});

export const timelineEntrySchema = z.discriminatedUnion("type", [
  resumeEntrySchema,
  skillsEntrySchema,
  experienceEntrySchema,
  educationEntrySchema,
  projectEntrySchema,
]);

export const timelineSchema = z.object({
  entries: z.array(timelineEntrySchema),
});

export type ResumeEntry = z.infer<typeof resumeEntrySchema>;
export type SkillsTimelineEntry = z.infer<typeof skillsEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type NarrativeEntry = ExperienceEntry | EducationEntry | ProjectEntry;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

import type { SkillCategory } from "./skills";

export type ResolvedSkillsEntry = {
  id: string;
  order: number;
  visible: boolean;
  type: "skills";
  categories: SkillCategory[];
};

export type ResolvedTimelineEntry =
  | ResumeEntry
  | ResolvedSkillsEntry
  | ExperienceEntry
  | EducationEntry
  | ProjectEntry;

export function isNarrativeEntry(
  entry: ResolvedTimelineEntry
): entry is ExperienceEntry | EducationEntry | ProjectEntry {
  return (
    entry.type === "experience" ||
    entry.type === "education" ||
    entry.type === "project"
  );
}
