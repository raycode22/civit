import type { Tool } from './types';
import { meta as base64Meta } from '$tools/base64-image-encoder/meta';
import { meta as pxToRemMeta } from '$tools/px-to-rem/meta';
import { meta as wordCounterMeta } from '$tools/word-counter/meta';
import { meta as faviconGeneratorMeta } from '$tools/favicon-generator/meta';
import { meta as imageClipperMeta } from '$tools/image-clipper/meta';
import { meta as metadataStripperMeta } from '$tools/metadata-stripper/meta';
import { meta as imageDeSkewMeta } from '$tools/image-de-skew/meta';
import { meta as imageMaskerMeta } from '$tools/image-masker/meta';
import { meta as largeTypeMeta } from '$tools/large-type/meta';
import { meta as paperSizesMeta } from '$tools/paper-sizes/meta';
import { meta as glyphBrowserMeta } from '$tools/glyph-browser/meta';

/**
 * Central tool registry. Adding a tool means registering its metadata and a
 * lazy component loader here; the catalog, search index, and `/tools/[id]`
 * routes pick it up automatically.
 *
 * Only separately approved tools from the PRD §12 catalog may be registered
 * (PRD FR-37). Component loaders use dynamic `import()` so each tool's chunk
 * loads only when its route is opened (PRD FR-24).
 */
export const tools: Tool[] = [
  {
    ...base64Meta,
    component: () => import('$tools/base64-image-encoder/Tool.svelte')
  },
  {
    ...pxToRemMeta,
    component: () => import('$tools/px-to-rem/Tool.svelte')
  },
  {
    ...wordCounterMeta,
    component: () => import('$tools/word-counter/Tool.svelte')
  },
  {
    ...faviconGeneratorMeta,
    component: () => import('$tools/favicon-generator/Tool.svelte')
  },
  {
    ...imageClipperMeta,
    component: () => import('$tools/image-clipper/Tool.svelte')
  },
  {
    ...metadataStripperMeta,
    component: () => import('$tools/metadata-stripper/Tool.svelte')
  },
  {
    ...imageDeSkewMeta,
    component: () => import('$tools/image-de-skew/Tool.svelte')
  },
  {
    ...imageMaskerMeta,
    component: () => import('$tools/image-masker/Tool.svelte')
  },
  {
    ...largeTypeMeta,
    component: () => import('$tools/large-type/Tool.svelte')
  },
  {
    ...paperSizesMeta,
    component: () => import('$tools/paper-sizes/Tool.svelte')
  },
  {
    ...glyphBrowserMeta,
    component: () => import('$tools/glyph-browser/Tool.svelte')
  }
];

/** Look up a tool by its route id. */
export function getTool(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}
