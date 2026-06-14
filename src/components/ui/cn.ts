// Minimal className combiner — avoids pulling in a dependency for trivial joins.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
