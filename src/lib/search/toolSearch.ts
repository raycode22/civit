// Civit search — Phase 2, Prompt 2B.
// Pure, browser-free search over the typed tool registry. Drives home-page
// search and category browsing (wired into pages in this prompt's UI updates).

import type { ToolMetadata } from '../tools/types';

/** Normalize a string for matching: lowercase, trim, collapse internal whitespace. */
export function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Tokenize a query into non-empty normalized terms. */
export function tokenizeQuery(query: string): string[] {
  const norm = normalize(query);
  return norm.length === 0 ? [] : norm.split(' ');
}

/** All searchable haystack strings for one tool entry. */
function haystack(tool: ToolMetadata): string[] {
  return [tool.name, tool.shortDescription, ...tool.keywords, ...tool.tags, tool.category];
}

/** Score one tool against one term; higher is better, 0 means no match. */
function scoreTerm(term: string, tool: ToolMetadata): number {
  const name = normalize(tool.name);
  if (name === term) return 100; // exact name
  if (name.startsWith(term)) return 80; // name prefix
  if (name.includes(term)) return 60; // name substring
  for (const kw of tool.keywords.map(normalize)) {
    if (kw === term) return 70; // alias/keyword exact
    if (kw.includes(term)) return 50; // keyword substring
  }
  const cat = normalize(tool.category);
  if (cat === term || cat.startsWith(term)) return 40; // category match
  if (tool.tags.some((t) => normalize(t).includes(term))) return 30;
  if (normalize(tool.shortDescription).includes(term)) return 20; // description match
  return 0;
}

/** Total score of a tool across all query terms. A tool must match EVERY term (AND semantics). */
export function scoreTool(query: string, tool: ToolMetadata): number {
  const terms = tokenizeQuery(query);
  if (terms.length === 0) return 0;
  let total = 0;
  for (const term of terms) {
    const s = scoreTerm(term, tool);
    if (s === 0 && !haystack(tool).some((h) => normalize(h).includes(term))) return 0;
    total += s === 0 ? 5 : s; // weak fallback only if haystack contains it
  }
  return total;
}

export interface SearchResult {
  tool: ToolMetadata;
  score: number;
}

/**
 * Search tools by names, aliases/keywords, tags, category, and description.
 * - Empty/whitespace-only query → empty result list (safe behavior, no crash).
 * - Results sorted by score desc, then name asc for stability.
 * - Callers pass only tools that are allowed to be shown (e.g., publishedTools).
 */
export function searchTools(query: string, candidates: readonly ToolMetadata[]): SearchResult[] {
  if (tokenizeQuery(query).length === 0) return [];
  const scored = candidates
    .map((tool) => ({ tool, score: scoreTool(query, tool) }))
    .filter((r) => r.score > 0);
  scored.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
  return scored;
}

/** Filter candidates by exact category. Unknown/empty category → empty list. */
export function filterByCategory(
  category: string,
  candidates: readonly ToolMetadata[],
): ToolMetadata[] {
  const norm = normalize(category);
  if (norm.length === 0) return [];
  return candidates.filter((t) => normalize(t.category) === norm);
}
