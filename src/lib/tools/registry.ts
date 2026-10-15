import type { Tool } from './types';
import { meta as base64Meta } from '$tools/base64-image-encoder/meta';
import Base64ImageEncoder from '$tools/base64-image-encoder/Tool.svelte';

/**
 * Central tool registry. Adding a tool means registering its metadata and
 * component here; the catalog, search index, and `/tools/[id]` routes pick
 * it up automatically.
 */
export const tools: Tool[] = [
	{
		...base64Meta,
		component: Base64ImageEncoder
	}
];

/** Look up a tool by its route id. */
export function getTool(id: string): Tool | undefined {
	return tools.find((tool) => tool.id === id);
}
