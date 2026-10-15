import { t as getTool } from "../../../../chunks/registry.js";
import { error } from "@sveltejs/kit";
//#region src/routes/tools/[id]/+page.ts
var prerender = false;
var load = ({ params }) => {
	const tool = getTool(params.id);
	if (!tool) error(404, `Unknown tool: ${params.id}`);
	return { tool };
};
//#endregion
export { load, prerender };
