import { cn } from "@/lib/cn";
import {
  dotGlow,
  proficiencyColor,
  type ProficiencyLevel,
} from "@/lib/skills/proficiency";

type SkillDotsProps = {
  level: ProficiencyLevel;
  className?: string;
};

export function SkillDots({ level, className }: SkillDotsProps) {
  const color = proficiencyColor(level);
  const glow = dotGlow(level);

  return (
    <div
      className={cn("flex shrink-0 gap-1", className)}
      aria-label={`Proficiency ${level} of 4`}
    >
      {[1, 2, 3, 4].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            dot <= level ? "" : "bg-white/10"
          )}
          style={
            dot <= level
              ? {
                  backgroundColor: color,
                  boxShadow: glow,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
