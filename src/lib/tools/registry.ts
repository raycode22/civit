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
  {
    id: 'uuid-generator',
    slug: 'uuid-generator',
    name: 'UUID Generator',
    shortDescription: 'Generate batches of random UUID v4 values locally with Web Crypto.',
    category: 'developer',
    tags: ['uuid', 'guid', 'random'],
    keywords: ['unique id', 'identifier', 'uuid4', 'v4', 'generator'],
    status: 'implemented',
    component: 'src/components/tools/UuidGenerator.svelte',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy', 'download'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'UUIDs are generated from your browser\u2019s cryptographic random API (crypto.randomUUID / getRandomValues \u2014 never Math.random). Nothing is uploaded, logged, or stored.',
    sizeLimit: 'Up to 1,000 UUIDs per batch.',
  },
  {
    id: 'password-generator',
    slug: 'password-generator',
    name: 'Password Generator',
    shortDescription: 'Generate passwords from configurable character sets using unbiased Web Crypto sampling.',
    category: 'developer',
    tags: ['password', 'security', 'random'],
    keywords: ['passphrase', 'strong password', 'credential', 'generator'],
    status: 'implemented',
    component: 'src/components/tools/PasswordGenerator.svelte',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Passwords are generated locally with crypto.getRandomValues and rejection sampling. They are never uploaded, logged, or automatically stored \u2014 copying is an explicit user action.',
    sizeLimit: 'Length 8\u2013128 characters per password.',
  },
  {
    id: 'word-counter',
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, lines, sentences, paragraphs, and reading time as you type.',
    category: 'text',
    tags: ['word count', 'characters', 'reading time'],
    keywords: ['character count', 'line count', 'text statistics', 'reading time', 'essay length'],
    status: 'implemented',
    component: 'src/components/tools/WordCounter.svelte',
    inputs: ['text'],
    outputs: [],
    exportActions: [],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Text is counted in memory on this device only. It is never sent to a server, stored, or logged.',
    sizeLimit: 'Up to 2,000,000 characters.',
  },
  {
    id: 'base64-tool',
    slug: 'base64-tool',
    name: 'Base64 Encoder/Decoder',
    shortDescription: 'Encode UTF-8 text to Base64 or decode Base64 back to text, entirely in your browser.',
    category: 'developer',
    tags: ['base64', 'encode', 'decode'],
    keywords: ['b64', 'atob', 'btoa', 'encoding'],
    status: 'implemented',
    component: 'src/components/tools/Base64Tool.svelte',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Encoding/decoding uses native browser APIs in memory only. Nothing is uploaded or stored. Base64 is an encoding, not encryption.',
    sizeLimit: 'Up to 2,000,000 characters per operation.',
  },
  {
    id: 'url-encoder',
    slug: 'url-encoder',
    name: 'URL Encoder/Decoder',
    shortDescription: 'Percent-encode URL components or decode them back, using platform encodeURIComponent semantics.',
    category: 'developer',
    tags: ['url', 'percent-encoding', 'encode', 'decode'],
    keywords: ['urlencode', 'escape', 'query string', 'uri component'],
    status: 'implemented',
    component: 'src/components/tools/UrlEncoder.svelte',
    inputs: ['text'],
    outputs: ['text/plain'],
    exportActions: ['copy'],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Encoding/decoding uses native browser APIs in memory only. Nothing is uploaded or stored. Percent-encoding is not encryption.',
    sizeLimit: 'Standard textarea limits; very large inputs may slow the page.',
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
