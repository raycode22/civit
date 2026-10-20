/**
 * Minimal deterministic text helper used by the Prompt 1A verification island.
 * Pure TypeScript, no DOM/browser dependencies, unit-tested in `tests/`.
 * (The real Word Counter tool arrives as a vertical slice in Phase 3.)
 */
export function countLocalWords(input: string): number {
  const trimmed = input.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}
