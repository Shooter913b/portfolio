import { z } from "zod";
import type { ProficiencyLevel } from "@/lib/skills/proficiency";

export const proficiencyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]) satisfies z.ZodType<ProficiencyLevel>;

export const skillItemSchema = z.object({
  name: z.string().min(1),
  level: proficiencyLevelSchema,
});

export const skillCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  skills: z.array(skillItemSchema),
});

export const skillsSchema = z.object({
  categories: z.array(skillCategorySchema),
});

export type SkillItem = z.infer<typeof skillItemSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Skills = z.infer<typeof skillsSchema>;

/** @deprecated Legacy shape — migrated on read via migrateSkillCategory */
export type LegacySkillCategory = {
  id: string;
  label: string;
  strong?: string[];
  standard?: string[];
  skills?: SkillItem[];
};
