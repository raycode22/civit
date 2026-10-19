/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { tools, getTool } from '$lib/tools/registry';
import { TOOL_CATEGORIES, CATEGORY_LABELS } from '$lib/tools/categories';

const TOOL_CATEGORIES_SET = new Set<string>(TOOL_CATEGORIES);
const TOOL_STATUSES = new Set(['new', 'beta', 'stable']);
const OFFLINE_VALUES = new Set(['full', 'partial', 'online-only']);
const REQUIREMENT_VALUES = new Set(['wasm', 'ml-model', 'camera-mic-screen', 'clipboard']);

describe('tool registry schema (PRD FR-21)', () => {
  it('contains at least the initial Base64 encoder tool', () => {
    expect(tools.length).toBeGreaterThanOrEqual(1);
    expect(getTool('base64-image-encoder')).toBeDefined();
  });

  it('every registered tool has all FR-21 fields populated with valid values', () => {
    for (const tool of tools) {
      expect(tool.id, 'id').toMatch(/^[a-z0-9-]+$/);
      expect(tool.name, `${tool.id} name`).toBeTruthy();
      expect(tool.description, `${tool.id} description`).toBeTruthy();
      expect(tool.keywords.length, `${tool.id} keywords`).toBeGreaterThan(0);
      expect(TOOL_CATEGORIES_SET.has(tool.category), `${tool.id} category`).toBe(true);
      expect(TOOL_STATUSES.has(tool.status), `${tool.id} status`).toBe(true);
      expect(OFFLINE_VALUES.has(tool.offline), `${tool.id} offline`).toBe(true);
      expect(Array.isArray(tool.requires), `${tool.id} requires`).toBe(true);
      for (const req of tool.requires) {
        expect(REQUIREMENT_VALUES.has(req), `${tool.id} requires[${req}]`).toBe(true);
      }
      expect(['function', 'object']).toContain(typeof tool.icon);
      expect(tool.icon, `${tool.id} icon`).toBeTruthy();
      expect(typeof tool.component, `${tool.id} component loader`).toBe('function');
    }
  });

  it('every registered tool id is unique', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offline values of `full`/`partial` are only used for the one tool with a recorded network-disabled run', () => {
    // PRD FR-30: no offline badge without a recorded verification. Today the
    // recorded runs are the Playwright tests in tests/e2e/offline-tools.spec.ts
    // (run with `context.setOffline(true)`) covering all five registered tools.
    // When more tools gain verified runs, extend this allow-list alongside
    // that evidence.
    const verified = new Set([
      'base64-image-encoder',
      'px-to-rem',
      'word-counter',
      'favicon-generator',
      'image-clipper',
      'metadata-stripper'
    ]);
    for (const tool of tools) {
      if (tool.offline !== 'online-only') {
        expect(
          verified.has(tool.id),
          `${tool.id} claims offline support without a recorded run`
        ).toBe(true);
      }
    }
  });
});

describe('registry scope guard (PRD FR-37)', () => {
  // Read the PRD at build time via Vite (no Node typings needed in this test).
  const prdModules = import.meta.glob('../../docs/02-PRD.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as Record<string, string>;
  const prd = Object.values(prdModules)[0] ?? '';

  it('the PRD catalog is readable from this test', () => {
    expect(prd).toContain('## 12. Tool catalog');
  });

  it('every registered tool appears in the PRD §12 catalog', () => {
    for (const tool of tools) {
      expect(prd, `${tool.id} is not in the PRD catalog`).toContain(`| ${tool.name} |`);
    }
  });

  it('every catalogued category has a label', () => {
    for (const cat of TOOL_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
    }
  });
});
