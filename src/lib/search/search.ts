import Fuse from 'fuse.js';
import type { ToolMeta } from '$lib/tools/types';

/** [NEW] Filters that compose with search (PRD FR-23). */
export interface ToolFilters {
  /** Restrict to one category; `null`/`undefined` means all categories. */
  category?: string | null;
  /**
   * "Offline-ready (Docker)" filter (PRD FR-23, D-20): keep tools whose
   * declared offline support is anything except `online-only`
   * (i.e. `full` or `partial`).
   */
  offlineOnly?: boolean;
}

/** Fields searched, with weights favoring the name. */
const KEYS = [
  { name: 'name', weight: 0.5 },
  { name: 'keywords', weight: 0.3 },
  { name: 'description', weight: 0.2 }
] as const;

/**
 * [NEW] Apply category and offline filters without searching.
 * An empty filter set returns the input unchanged.
 */
export function filterTools(tools: ToolMeta[], filters: ToolFilters = {}): ToolMeta[] {
  const { category = null, offlineOnly = false } = filters;
  if (!category && !offlineOnly) return tools;
  return tools.filter((tool) => {
    if (category && tool.category !== category) return false;
    if (offlineOnly && tool.offline === 'online-only') return false;
    return true;
  });
}

/**
 * Search the tool catalog with fuzzy matching (Fuse.js), optionally
 * composed with a category filter and the "Offline-ready (Docker)" filter
 * (FR-23, D-20).
 * Returns matches ranked by score; an empty query returns all tools that
 * pass the filters.
 */
export function searchTools(
  query: string,
  tools: ToolMeta[],
  filters: ToolFilters = {}
): ToolMeta[] {
  const candidates = filterTools(tools, filters);
  const trimmed = query.trim();
  if (!trimmed) return candidates;
  const fuse = new Fuse(candidates, {
    keys: KEYS.map((k) => ({ name: k.name, weight: k.weight })),
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
  return fuse.search(trimmed).map((result) => result.item);
}
