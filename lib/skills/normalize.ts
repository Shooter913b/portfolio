import type { SkillCategory, SkillItem, LegacySkillCategory } from "@/lib/schemas/skills";

export function migrateSkillCategory(category: LegacySkillCategory): SkillCategory {
  const hasLegacy =
    (category.strong?.length ?? 0) > 0 || (category.standard?.length ?? 0) > 0;

  if (hasLegacy) {
    const skills: SkillItem[] = [
      ...(category.strong ?? []).map((name) => ({ name, level: 4 as const })),
      ...(category.standard ?? []).map((name) => ({ name, level: 2 as const })),
    ];

    return {
      id: category.id,
      label: category.label,
      skills: skills.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name)),
    };
  }

  const skills = Array.isArray((category as SkillCategory).skills)
    ? (category as SkillCategory).skills
    : [];

  return {
    id: category.id,
    label: category.label,
    skills,
  };
}

export function normalizeSkills(data: { categories: unknown[] }): {
  categories: SkillCategory[];
} {
  return {
    categories: data.categories.map((category) =>
      migrateSkillCategory(category as LegacySkillCategory)
    ),
  };
}
