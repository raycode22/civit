// Civit tool routes — Phase 2, Prompt 2B.
// Static route paths are derived from the registry: /tools/<slug>/ with a
// trailing slash so direct navigation and refresh work in Astro static output
// (builds emit dist/tools/<slug>/index.html).

import { publishedTools } from './registry';

/** Canonical public URL path for one tool entry (trailing slash included). */
export function toolPath(slug: string): string {
  return `/tools/${slug}/`;
}

/** Paths for all implemented/published tools. Empty today; grows with Phase 3 slices. */
export function publishedToolPaths(): string[] {
  return publishedTools.map((t) => toolPath(t.slug));
}

/**
 * getStaticPaths params for src/pages/tools/[slug].astro.
 * Returns an empty array while no tool is implemented — Astro then emits no
 * dynamic tool routes, which is the required safe behavior (planned tools must
 * not appear as if they work).
 */
export function toolStaticPaths(): { params: { slug: string } }[] {
  return publishedTools.map((t) => ({ params: { slug: t.slug } }));
}
