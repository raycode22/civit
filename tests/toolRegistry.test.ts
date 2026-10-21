// Civit tool registry + search tests — Phase 2, Prompt 2B.
import { describe, expect, it } from 'vitest';

import { publishedTools, publishedToolCount, tools, getToolBySlug } from '../src/lib/tools/registry';
import { validateRegistry, registryIsSound } from '../src/lib/tools/validate';
import { toolPath, publishedToolPaths, toolStaticPaths } from '../src/lib/tools/routes';
import type { ToolMetadata } from '../src/lib/tools/types';
import { hasRequiredFields } from '../src/lib/tools/types';
import { filterByCategory, normalize, searchTools, tokenizeQuery } from '../src/lib/search/toolSearch';

/** A fully-populated fake implemented tool for search/validation tests. */
function fakeTool(overrides: Partial<ToolMetadata> = {}): ToolMetadata {
  return {
    id: 'json-formatter',
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Parse, pretty-print, and minify JSON locally.',
    category: 'developer',
    tags: ['json', 'format'],
    keywords: ['beautify', 'prettify', 'minify'],
    status: 'implemented',
    component: '/tools/json-formatter/',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy', 'download'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Runs entirely in your browser; nothing is uploaded.',
    ...overrides,
  };
}

describe('registry (current state)', () => {
  it('contains exactly the implemented slices shipped so far (3A: JSON Formatter; 3B: UUID + Password Generators; 3C: Word Counter + Base64 + URL Encoder)', () => {
    expect(tools.map((t) => t.slug)).toEqual([
      'json-formatter',
      'uuid-generator',
      'password-generator',
      'word-counter',
      'base64-tool',
      'url-encoder',
    ]);
    expect(publishedTools.map((t) => t.slug)).toEqual([
      'json-formatter',
      'uuid-generator',
      'password-generator',
      'word-counter',
      'base64-tool',
      'url-encoder',
    ]);
    expect(publishedToolCount()).toBe(6);
  });

  it('every published tool has required metadata and a real component reference', () => {
    for (const tool of publishedTools) {
      expect(tool.status).toBe('implemented');
      expect(typeof tool.component).toBe('string');
      expect(tool.component!.length).toBeGreaterThan(0);
      expect(hasRequiredFields(tool)).toBe(true);
    }
  });

  it('getToolBySlug returns undefined for unknown slugs', () => {
    expect(getToolBySlug('nonexistent')).toBeUndefined();
  });

  it('validation passes on the real registry', () => {
    expect(validateRegistry()).toEqual([]);
    expect(registryIsSound()).toBe(true);
  });

  it('route helpers produce stable trailing-slash paths', () => {
    expect(toolPath('json-formatter')).toBe('/tools/json-formatter/');
    // Registry-driven: the six implemented slices yield exactly six routes.
    expect(publishedToolPaths()).toEqual([
      '/tools/json-formatter/',
      '/tools/uuid-generator/',
      '/tools/password-generator/',
      '/tools/word-counter/',
      '/tools/base64-tool/',
      '/tools/url-encoder/',
    ]);
    expect(toolStaticPaths()).toEqual([
      { params: { slug: 'json-formatter' } },
      { params: { slug: 'uuid-generator' } },
      { params: { slug: 'password-generator' } },
      { params: { slug: 'word-counter' } },
      { params: { slug: 'base64-tool' } },
      { params: { slug: 'url-encoder' } },
    ]);
  });
});

describe('registry validation rules', () => {
  it('rejects duplicate ids/slugs', () => {
    const dupes = [fakeTool(), fakeTool()];
    const issues = validateRegistry(dupes);
    expect(issues.some((i) => i.problem === 'duplicate id')).toBe(true);
    expect(issues.some((i) => i.problem === 'duplicate slug')).toBe(true);
  });

  it('rejects missing/unknown category', () => {
    const bad = fakeTool({ category: 'audio' as never, id: 'x', slug: 'x' });
    const issues = validateRegistry([bad]);
    expect(issues.some((i) => i.problem.includes('category'))).toBe(true);
  });

  it('rejects invalid slugs and id/slug mismatch', () => {
    const issues = validateRegistry([fakeTool({ slug: 'JSON Formatter' })]);
    expect(issues.some((i) => i.problem.includes('invalid slug'))).toBe(true);
    const mismatch = validateRegistry([fakeTool({ slug: 'other-slug' })]);
    expect(mismatch.some((i) => i.problem.includes('id and slug must match'))).toBe(true);
  });

  it('requires a component for implemented tools and forbids one for planned tools', () => {
    const noComponent = validateRegistry([fakeTool({ component: undefined })]);
    expect(noComponent.some((i) => i.problem.includes('no component/loader'))).toBe(true);
    const plannedWithComponent = validateRegistry([
      fakeTool({ status: 'planned', component: '/tools/json-formatter/' }),
    ]);
    expect(plannedWithComponent.some((i) => i.problem.includes('declares a component'))).toBe(true);
  });
});

describe('search matching', () => {
  const json = fakeTool();
  const word = fakeTool({
    id: 'word-counter',
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, and lines.',
    category: 'text',
    tags: ['text', 'count'],
    keywords: ['wc', 'reading time'],
    component: '/tools/word-counter/',
  });
  const candidates = [json, word];

  it('matches by name', () => {
    const results = searchTools('json formatter', candidates);
    expect(results[0]?.tool.id).toBe('json-formatter');
  });

  it('matches by alias/keyword', () => {
    const results = searchTools('beautify', candidates);
    expect(results.map((r) => r.tool.id)).toContain('json-formatter');
  });

  it('matches by category', () => {
    const results = searchTools('text', candidates);
    expect(results.map((r) => r.tool.id)).toContain('word-counter');
  });

  it('matches by description substring', () => {
    const results = searchTools('pretty-print', candidates);
    expect(results.map((r) => r.tool.id)).toContain('json-formatter');
  });

  it('ranks exact name above weaker matches', () => {
    const results = searchTools('word counter', candidates);
    expect(results[0]?.tool.id).toBe('word-counter');
    // json-formatter must NOT match "word counter" at all under AND semantics
    // (neither term appears in its haystack), so only word-counter is returned.
    expect(results.map((r) => r.tool.id)).toEqual(['word-counter']);
    // Ranking proof with a query both tools can match: exact-name beats substring.
    const both = searchTools('count', candidates);
    expect(both[0]?.tool.id).toBe('word-counter'); // name prefix > description/tag match
  });

  it('empty and whitespace-only queries return no results (safe behavior)', () => {
    expect(searchTools('', candidates)).toEqual([]);
    expect(searchTools('   ', candidates)).toEqual([]);
  });

  it('no-match queries return an empty list without throwing', () => {
    expect(searchTools('quantum flux capacitor', candidates)).toEqual([]);
  });

  it('AND semantics: all terms must appear somewhere in the haystack', () => {
    expect(searchTools('json reading', candidates)).toEqual([]);
  });

  it('tokenize/normalize helpers', () => {
    expect(normalize('  JSON   Formatter ')).toBe('json formatter');
    expect(tokenizeQuery('a b')).toEqual(['a', 'b']);
    expect(tokenizeQuery('')).toEqual([]);
  });

  it('filterByCategory: known category filters, unknown/empty → empty list', () => {
    expect(filterByCategory('developer', candidates).map((t) => t.id)).toEqual(['json-formatter']);
    expect(filterByCategory('design', candidates)).toEqual([]); // empty category state
    expect(filterByCategory('', candidates)).toEqual([]);
  });

  it('search over the real published registry finds the shipped JSON Formatter', () => {
    const hits = searchTools('json', publishedTools);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.tool.slug).toBe('json-formatter');
    // Unknown terms still yield no results without throwing.
    expect(searchTools('zzz-not-a-tool', publishedTools)).toEqual([]);
  });
});
