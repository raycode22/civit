import type { Tool } from './types';
import { meta as base64Meta } from '$tools/base64-image-encoder/meta';

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
  }
];

/** Look up a tool by its route id. */
export function getTool(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}
