/** Shared blue → purple accent glow strings for inline styles. */

export const accentGlowSm =
  "0 0 10px rgb(0 212 255 / 0.35), 0 0 20px rgb(168 85 247 / 0.25)";

export const accentGlowMd =
  "0 0 14px 3px rgb(0 212 255 / 0.45), 0 0 28px 6px rgb(168 85 247 / 0.35)";

export const accentGlowText =
  "0 0 10px rgb(0 212 255 / 0.55), 0 0 20px rgb(168 85 247 / 0.4)";

export const accentGlowTextStrong =
  "0 0 8px rgb(0 212 255 / 0.55), 0 0 18px rgb(168 85 247 / 0.45), 0 0 28px rgb(0 212 255 / 0.2)";

export function accentDotGlow(intensity: number): string {
  return `0 0 6px rgb(0 212 255 / ${intensity * 0.55}), 0 0 12px rgb(168 85 247 / ${intensity * 0.4})`;
}
