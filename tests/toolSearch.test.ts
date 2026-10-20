// Prompt 2A — unit tests for the pure search logic used by the home-page
// search island and category browsing. Browser-free; runs under Vitest.
import { describe, it, expect } from 'vitest';
import { tools, publishedTools } from '../src/lib/tools/registry';
import { plannedTools } from '../src/lib/tools/catalogue';
import { normalize, tokenizeQuery, searchTools, filterByCategory } from '../src/lib/search/toolSearch';

describe('normalize/tokenize', () => {
  it('lowercases, trims, collapses whitespace', () => {
    expect(normalize('  JSON   Formatter ')).toBe('json formatter');
  });
  it('empty/whitespace query tokenizes to nothing', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });
});

describe('searchTools (Prompt 2B rule: names, aliases, category, description)', () => {
  const candidates = publishedTools;

  it('matches by name', () => {
    const r = searchTools('json', candidates);
    expect(r.map((x) => x.tool.slug)).toContain('json-formatter');
  });
  it('matches by alias/keyword', () => {
    const r = searchTools('beautifier', candidates);
    expect(r.map((x) => x.tool.slug)).toContain('json-formatter');
  });
  it('matches by category', () => {
    const r = searchTools('developer', candidates);
    expect(r.map((x) => x.tool.slug)).toContain('json-formatter');
  });
  it('matches by description words', () => {
    const r = searchTools('minify', candidates);
    expect(r.map((x) => x.tool.slug)).toContain('json-formatter');
  });
  it('exact name ranks above substring matches', () => {
    const r = searchTools('json formatter', candidates);
    expect(r[0]?.tool.slug).toBe('json-formatter');
  });
  it('empty or whitespace-only query → empty results (safe behavior)', () => {
    expect(searchTools('', candidates)).toEqual([]);
    expect(searchTools('    ', candidates)).toEqual([]);
  });
  it('invalid/no-match query → empty results, no crash', () => {
    expect(searchTools('zzz nonexistent qqq', candidates)).toEqual([]);
  });
  it('AND semantics: all terms must match somewhere', () => {
    expect(searchTools('json zzznope', candidates)).toEqual([]);
  });
  it('never returns planned tools when given only published candidates', () => {
    for (const res of searchTools('word counter', candidates)) {
      expect(res.tool.status).toBe('implemented');
    }
  });
});

describe('filterByCategory', () => {
  it('returns only tools in the exact category', () => {
    expect(filterByCategory('developer', publishedTools).map((t) => t.slug)).toContain('json-formatter');
    expect(filterByCategory('design', publishedTools)).toEqual([]); // explicit empty state
  });
  it('unknown or empty category → empty list', () => {
    expect(filterByCategory('bogus', publishedTools)).toEqual([]);
    expect(filterByCategory('', publishedTools)).toEqual([]);
  });
});

describe('catalogue integrity (Prompt 2A honesty rules)', () => {
  it('every catalogue entry is status planned — none can look implemented', () => {
    for (const t of plannedTools) expect(t.status).toBe('planned');
  });
  it('catalogue does not duplicate registry slugs', () => {
    const registered = new Set(tools.map((t) => t.slug));
    for (const t of plannedTools) expect(registered.has(t.slug)).toBe(false);
  });
  it('planned entries carry an honest privacy note stating they are not built', () => {
    for (const t of plannedTools) expect(t.privacyNote).toMatch(/not implemented/i);
  });
  it('planned entries define no component (no fake routes possible)', () => {
    for (const t of plannedTools) expect(t.component).toBeUndefined();
  });
});
