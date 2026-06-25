import type { Animation } from "@/lib/types";

/** Convert a duration token (ms) into seconds for Framer Motion. */
export function toSeconds(ms: number): number {
  return Math.max(ms, 1) / 1000;
}

/** Build a Framer Motion transition from an animation's tokens,
 *  collapsing to a near-instant transition when reduced motion is on. */
export function transitionFor(anim: Animation, reduced: boolean) {
  if (reduced) return { duration: 0.001 };
  return {
    duration: toSeconds(anim.duration.value),
    ease: anim.easing.cubicBezier as [number, number, number, number],
  };
}

/** Human-readable cubic-bezier string for display. */
export function cubicBezierString(cb: number[]): string {
  return `cubic-bezier(${cb.join(", ")})`;
}
