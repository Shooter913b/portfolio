import { readJsonFile } from "./readJson";
import { skillsSchema, type Skills } from "@/lib/schemas/skills";
import { normalizeSkills } from "@/lib/skills/normalize";

export function getSkills(): Skills {
  const raw = readJsonFile("content/skills.json") as { categories: unknown[] };
  return skillsSchema.parse(normalizeSkills(raw));
}
