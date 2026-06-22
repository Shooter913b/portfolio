import type { SkillCategory } from "@/lib/schemas/skills";
import { SkillCategoryPanel } from "./SkillCategoryPanel";

type SkillsBlockProps = {
  categories: SkillCategory[];
};

/** Static multi-category skills list (non-carousel). */
export function SkillsBlock({ categories }: SkillsBlockProps) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
        Skills
      </p>
      <div className="mt-6 space-y-8">
        {categories.map((category) => (
          <SkillCategoryPanel key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
