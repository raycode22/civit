import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getTool } from '$lib/tools/registry';

export const load: PageLoad = ({ params }) => {
	const tool = getTool(params.id);
	if (!tool) {
		error(404, `Unknown tool: ${params.id}`);
	}
	return { tool };
};
