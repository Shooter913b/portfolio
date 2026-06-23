import type { SkillCategory } from "@/lib/schemas/skills";
import {
  proficiencyColor,
  proficiencyTextShadow,
  type ProficiencyLevel,
} from "@/lib/skills/proficiency";
import { SkillDots } from "./SkillDots";

export function buildSkillList(
  category: SkillCategory
): { name: string; level: ProficiencyLevel }[] {
  const skills = category.skills ?? [];
  return [...skills].sort(
    (a, b) => b.level - a.level || a.name.localeCompare(b.name)
  );
}

type SkillCategoryPanelProps = {
  category: SkillCategory;
};

export function SkillCategoryPanel({ category }: SkillCategoryPanelProps) {
  const skills = buildSkillList(category);

  return (
    <section aria-label={category.label}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg font-medium text-text-primary">
          {category.label}
        </h3>
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Proficiency
        </p>
      </div>
      <ul className="mt-4 space-y-3">
        {skills.map(({ name, level }, skillIndex) => {
          const color = proficiencyColor(level);
          const textShadow = proficiencyTextShadow(level);

          return (
            <li
              key={`${name}-${skillIndex}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span
                className="font-medium transition-all duration-300"
                style={{ color, textShadow }}
              >
                {name}
              </span>
              <SkillDots level={level} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
