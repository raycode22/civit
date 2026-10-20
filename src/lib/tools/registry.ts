// Civit tool registry — Phase 2, Prompt 2B.
// Single typed source of display metadata and discovery (technical plan §4).
//
// Publication rule (build guide Prompt 2B / PRD): ONLY tools with status
// 'implemented' may appear in production navigation or be linked as working.
// Planned tools are NOT registered here; they are mentioned on /tools/ only as
// honest prose, never as catalogue entries that look clickable.
//
// The first real entry arrives with Prompt 3A (JSON Formatter) once its UI and
// tests exist ("Add it to the tool registry only after its UI and tests exist").

import type { ToolMetadata } from './types';

/** All registered tools. Only fully implemented + tested slices are listed here. */
export const tools: readonly ToolMetadata[] = [
  {
    id: 'json-formatter',
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Format (pretty-print) or minify JSON entirely in your browser.',
    category: 'developer',
    tags: ['json', 'format', 'minify'],
    keywords: ['json beautifier', 'prettify', 'pretty print', 'validate json', 'formatter'],
    status: 'implemented',
    component: 'src/components/tools/JsonFormatter.svelte',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Your JSON is parsed with native browser APIs, stays in memory on this device, and is never sent to a server or stored.',
    sizeLimit: 'Up to 2,000,000 characters per operation.',
  },
];

/** Tools safe to show in production navigation/search/category browsing. */
export const publishedTools: readonly ToolMetadata[] = tools.filter((t) => t.status === 'implemented');

/** Look up a registered tool by slug. Returns undefined for unknown slugs. */
export function getToolBySlug(slug: string): ToolMetadata | undefined {
  return tools.find((t) => t.slug === slug);
}

/** Count of implemented (publicly visible) tools. */
export function publishedToolCount(): number {
  return publishedTools.length;
}
