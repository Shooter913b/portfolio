/**
 * Shared blue → purple accent glow — keep in sync with `--accent-glow-*`
 * and `--glow-backlight-*` in `app/globals.css`.
 *
 * Four corner wrap (cyan NW → purple SE). Never use negative spread —
 * blur + negative spread is what rounds square corners off.
 */

export const ACCENT_BLUE_RGB = "0 212 255";
export const ACCENT_PURPLE_RGB = "168 85 247";

/** Gradient fill used by halo plates (profile photo, etc.). */
export const accentGlowGradient =
  "linear-gradient(135deg, rgb(0 212 255 / 0.32) 0%, rgb(168 85 247 / 0.28) 100%)";

export const accentGlowXs =
  "-8px -8px 10px 0 rgb(0 212 255 / 0.11), 8px -8px 10px 0 rgb(84 148 251 / 0.08), 8px 8px 10px 0 rgb(168 85 247 / 0.11), -8px 8px 10px 0 rgb(84 148 251 / 0.08)";

export const accentGlowSm =
  "-10px -10px 12px 0 rgb(0 212 255 / 0.13), 10px -10px 12px 0 rgb(84 148 251 / 0.09), 10px 10px 12px 0 rgb(168 85 247 / 0.13), -10px 10px 12px 0 rgb(84 148 251 / 0.09)";

export const accentGlowMd =
  "-12px -12px 14px 0 rgb(0 212 255 / 0.15), 12px -12px 14px 0 rgb(84 148 251 / 0.1), 12px 12px 14px 0 rgb(168 85 247 / 0.15), -12px 12px 14px 0 rgb(84 148 251 / 0.1)";

export const accentGlowLg =
  "-14px -14px 16px 0 rgb(0 212 255 / 0.17), 14px -14px 16px 0 rgb(84 148 251 / 0.11), 14px 14px 16px 0 rgb(168 85 247 / 0.17), -14px 14px 16px 0 rgb(84 148 251 / 0.11)";

export const accentGlowXl =
  "-16px -16px 18px 0 rgb(0 212 255 / 0.19), 16px -16px 18px 0 rgb(84 148 251 / 0.12), 16px 16px 18px 0 rgb(168 85 247 / 0.19), -16px 16px 18px 0 rgb(84 148 251 / 0.12)";

export const accentGlowText =
  "-4px -4px 10px 0 rgb(0 212 255 / 0.22), 4px 4px 12px 0 rgb(168 85 247 / 0.22)";

export const accentGlowTextStrong =
  "-4px -4px 10px 0 rgb(0 212 255 / 0.25), 4px 4px 14px 0 rgb(168 85 247 / 0.25)";

export function accentDotGlow(intensity: number): string {
  return `-4px -4px 8px 0 rgb(0 212 255 / ${intensity * 0.25}), 4px 4px 10px 0 rgb(168 85 247 / ${intensity * 0.28})`;
}
