import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getTool } from '$lib/tools/registry';

// The dynamic route cannot be crawled during prerendering (the catalog links
// are rendered client-side because ssr=false), so it is served through the
// SPA fallback and resolved in the browser instead.
export const prerender = false;

export const load: PageLoad = ({ params }) => {
  const tool = getTool(params.id);
  if (!tool) {
    error(404, `Unknown tool: ${params.id}`);
  }
  return { tool };
};
