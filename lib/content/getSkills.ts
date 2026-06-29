import { cache } from "react";
import { readJsonFile } from "./readJson";
import { skillsSchema, type Skills } from "@/lib/schemas/skills";
import { normalizeSkills } from "@/lib/skills/normalize";

export const getSkills = cache((): Skills => {
  const raw = readJsonFile("content/skills.json") as { categories: unknown[] };
  return skillsSchema.parse(normalizeSkills(raw));
});
