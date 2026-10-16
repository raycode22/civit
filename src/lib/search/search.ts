import Fuse from 'fuse.js';
import type { ToolMeta } from '$lib/tools/types';

/** Fields searched, with weights favoring the name. */
const KEYS = [
  { name: 'name', weight: 0.5 },
  { name: 'keywords', weight: 0.3 },
  { name: 'description', weight: 0.2 }
] as const;

/**
 * Search the tool catalog with fuzzy matching (Fuse.js).
 * Returns matches ranked by score; an empty query returns all tools.
 */
export function searchTools(query: string, tools: ToolMeta[]): ToolMeta[] {
  const trimmed = query.trim();
  if (!trimmed) return tools;
  const fuse = new Fuse(tools, {
    keys: KEYS.map((k) => ({ name: k.name, weight: k.weight })),
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
  return fuse.search(trimmed).map((result) => result.item);
}
