import {
  accentDotGlow,
  accentGlowText,
  accentGlowTextStrong,
} from "@/lib/theme/accents";

export type ProficiencyLevel = 1 | 2 | 3 | 4;

const PURPLE = { r: 168, g: 85, b: 247 };
const ELECTRIC_BLUE = { r: 0, g: 212, b: 255 };

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function proficiencyColor(level: ProficiencyLevel): string {
  const t = (level - 1) / 3;
  const r = lerp(PURPLE.r, ELECTRIC_BLUE.r, t);
  const g = lerp(PURPLE.g, ELECTRIC_BLUE.g, t);
  const b = lerp(PURPLE.b, ELECTRIC_BLUE.b, t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function proficiencyGlow(level: ProficiencyLevel): string | undefined {
  if (level < 4) return undefined;
  return accentGlowTextStrong;
}

export function proficiencyTextShadow(level: ProficiencyLevel): string | undefined {
  if (level < 4) return undefined;
  return accentGlowText;
}

export function dotGlow(level: ProficiencyLevel): string | undefined {
  if (level < 3) return undefined;
  const intensity = level === 4 ? 0.9 : 0.45;
  return accentDotGlow(intensity);
}
