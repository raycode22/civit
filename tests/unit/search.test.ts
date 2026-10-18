import { describe, it, expect } from 'vitest';
import { searchTools, filterTools } from '$lib/search/search';
import {
  groupToolsByCategory,
  sortToolsByCategory,
  TOOL_CATEGORIES,
  CATEGORY_LABELS
} from '$lib/tools/categories';
import type { ToolMeta, ToolCategory, OfflineSupport, ToolStatus } from '$lib/tools/types';

function makeTool(
  id: string,
  overrides: Partial<ToolMeta> & {
    category?: ToolCategory;
    offline?: OfflineSupport;
    status?: ToolStatus;
  } = {}
): ToolMeta {
  return {
    id,
    name: overrides.name ?? id,
    description: overrides.description ?? `${id} description`,
    keywords: overrides.keywords ?? [],
    category: overrides.category ?? 'images-assets',
    status: overrides.status ?? 'new',
    offline: overrides.offline ?? 'full',
    requires: overrides.requires ?? [],
    icon: overrides.icon ?? (undefined as unknown as ToolMeta['icon'])
  };
}

const fixture: ToolMeta[] = [
  makeTool('base64-image-encoder', {
    name: 'Base64 Image Encoder',
    keywords: ['base64', 'image'],
    category: 'images-assets',
    offline: 'full'
  }),
  makeTool('audio-normaliser', {
    name: 'Audio Normaliser',
    keywords: ['audio', 'normalise'],
    category: 'audio-video',
    offline: 'online-only'
  }),
  makeTool('word-counter', {
    name: 'Word Counter',
    keywords: ['word', 'count'],
    category: 'typography-text',
    offline: 'partial'
  })
];

describe('searchTools', () => {
  it('returns all tools for an empty query', () => {
    expect(searchTools('', fixture)).toHaveLength(3);
  });

  it('fuzzy-matches by name', () => {
    const r = searchTools('base64', fixture);
    expect(r.map((t) => t.id)).toContain('base64-image-encoder');
  });

  it('composes with a category filter', () => {
    const r = searchTools('', fixture, { category: 'audio-video' });
    expect(r.map((t) => t.id)).toEqual(['audio-normaliser']);
  });

  it('composes with the offline filter', () => {
    const r = searchTools('', fixture, { offlineOnly: true });
    // 'online-only' excluded; 'full' and 'partial' kept.
    expect(r.map((t) => t.id)).toEqual(['base64-image-encoder', 'word-counter']);
  });

  it('composes search text with both filters', () => {
    const r = searchTools('normal', fixture, { category: 'audio-video', offlineOnly: true });
    // audio-normaliser is online-only, so the offline filter excludes it.
    expect(r).toHaveLength(0);
  });
});

describe('filterTools', () => {
  it('returns the input unchanged when no filters are set', () => {
    expect(filterTools(fixture)).toEqual(fixture);
    expect(filterTools(fixture, {})).toEqual(fixture);
  });

  it('filters by a single category', () => {
    const r = filterTools(fixture, { category: 'typography-text' });
    expect(r.map((t) => t.id)).toEqual(['word-counter']);
  });

  it('keeps full and partial when offlineOnly is set', () => {
    const r = filterTools(fixture, { offlineOnly: true });
    expect(r.every((t) => t.offline !== 'online-only')).toBe(true);
    expect(r).toHaveLength(2);
  });
});

describe('groupToolsByCategory', () => {
  it('groups tools in canonical category order', () => {
    const groups = groupToolsByCategory(fixture);
    expect(groups.map((g) => g.category)).toEqual([
      'images-assets',
      'audio-video',
      'typography-text'
    ]);
  });

  it('drops empty categories', () => {
    const groups = groupToolsByCategory([fixture[0]]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('images-assets');
  });

  it('labels every category', () => {
    for (const cat of TOOL_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
    }
    expect(CATEGORY_LABELS['images-assets']).toBe('Images & Assets');
  });
});

describe('sortToolsByCategory', () => {
  it('orders tools by their category', () => {
    const sorted = sortToolsByCategory([fixture[2], fixture[1], fixture[0]]);
    expect(sorted.map((t) => t.id)).toEqual([
      'base64-image-encoder',
      'audio-normaliser',
      'word-counter'
    ]);
  });
});
