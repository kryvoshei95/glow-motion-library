import animationsRaw from "@/data/animations.json";
import tokensRaw from "@/data/tokens.json";
import type { Animation } from "@/lib/types";

export const animations = animationsRaw as Animation[];
export const tokens = tokensRaw as {
  durations: { token: string; value: number; cssVar: string; usage: string }[];
  easings: { token: string; cubicBezier: number[]; cssVar: string; usage: string }[];
  springs: { token: string; type: string; stiffness: number; damping: number; usage: string }[];
};

export function getAnimation(slug: string): Animation | undefined {
  return animations.find((a) => a.slug === slug);
}

export function getRelated(slug: string, limit = 3): Animation[] {
  const current = getAnimation(slug);
  if (!current) return [];
  return animations
    .filter((a) => a.slug !== slug && a.category === current.category)
    .slice(0, limit);
}
