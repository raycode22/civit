import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getTool, tools } from '$lib/tools/registry';

// [Stage 9A, FR-43 / D-09] Tool routes are prerendered. Each registered tool
// id is enumerated through SvelteKit's `entries`, so the static build emits
// `build/tools/<tool-id>.html` for every tool in the registry. Unknown ids
// still resolve client-side through the SPA fallback and show a 404 message.
export function entries(): { id: string }[] {
  return tools.map((tool) => ({ id: tool.id }));
}

export const load: PageLoad = ({ params }) => {
  const tool = getTool(params.id);
  if (!tool) {
    error(404, `Unknown tool: ${params.id}`);
  }
  return { tool };
};
