// Civit planning catalogue — Phase 2, Prompt 2A.
// Honest metadata for the MVP tools described in docs/planning/02-prd.md §4.
//
// IMPORTANT: every entry here has status 'planned'. Planned entries are NEVER
// linked as working tools and never appear in production navigation/search
// results as usable (build guide Prompt 2B rule). They exist so /tools/ can
// truthfully say "planned, not built yet" from a single typed source instead
// of hand-maintained prose lists that drift out of sync.
//
// The implemented JSON Formatter lives ONLY in registry.ts (status
// 'implemented'). Do not duplicate it here.

import type { ToolMetadata } from './types';

/** Minimal honest placeholder metadata for one planned tool. */
function planned(
  slug: string,
  name: string,
  shortDescription: string,
  category: ToolMetadata['category'],
  keywords: readonly string[],
): ToolMetadata {
  return {
    id: slug,
    slug,
    name,
    shortDescription,
    category,
    tags: [category],
    keywords,
    status: 'planned',
    inputs: ['text'],
    outputs: [],
    exportActions: [],
    assetWeight: 'small',
    offlineSupport: 'core',
    capabilities: [],
    privacyNote: 'Planned tool — not implemented yet. No processing occurs on this page.',
  };
}

/**
 * The 11 MVP utilities from the PRD, minus tools already implemented and
 * registered (JSON Formatter in 3A; UUID Generator and Password Generator in
 * 3B; Word Counter, Base64 Encoder/Decoder and URL Encoder/Decoder in 3C).
 * All entries here are status 'planned'.
 */
export const plannedTools: readonly ToolMetadata[] = [
  planned('case-converter', 'Case Converter', 'Convert text between upper, lower, title, sentence, camel, snake, and kebab cases.', 'text', ['uppercase', 'lowercase', 'camelcase', 'snake_case']),
  planned('lorem-ipsum', 'Lorem Ipsum Generator', 'Generate placeholder paragraphs, sentences, or words.', 'text', ['placeholder text', 'dummy text']),
  planned('slug-generator', 'Slug Generator', 'Turn titles into URL-safe slugs.', 'text', ['url slug', 'permalink']),
  planned('hash-generator', 'Hash Generator', 'Compute common hashes (e.g. SHA-256) for text using browser crypto APIs.', 'developer', ['sha256', 'checksum', 'digest']),
  planned('color-picker', 'Color Picker', 'Pick colors and inspect hex/rgb/hsl values locally.', 'design', ['hex', 'rgb', 'hsl']),
  planned('contrast-checker', 'Contrast Checker', 'Check foreground/background contrast ratios against WCAG thresholds.', 'design', ['wcag', 'accessibility', 'a11y']),
  planned('gradient-generator', 'Gradient Generator', 'Build CSS gradients with live preview and copyable code.', 'design', ['css gradient', 'linear-gradient']),
];
