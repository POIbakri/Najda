import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom fontSize utilities (tailwind.config.ts:
// text-caption/body/locator/title/hero). Without this it mistakes e.g. `text-body`
// for a text-COLOR class and, on a conflict, drops the real colour — so a primary
// button rendered `bg-ink-900 text-sand-50 … text-body` would lose `text-sand-50`
// and show invisible dark-on-dark text. Registering them as font-size keeps colour
// and size in separate conflict groups.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "body", "locator", "title", "hero"] }],
    },
  },
});

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Short, collision-resistant id without a dependency. */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Median of a numeric array, or null when empty. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
