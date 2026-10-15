import { C as attr, a as ensure_array_like, c as spread_props, o as head, r as derived, u as stringify, w as escape_html } from "../../chunks/server.js";
import { t as Icon } from "../../chunks/Icon.js";
import { n as tools, r as StatusBadge } from "../../chunks/registry.js";
import Fuse from "fuse.js";
//#region node_modules/@lucide/svelte/dist/icons/search.svelte
function Search($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "search",
		"size": 24,
		"node": [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
			"cx": "11",
			"cy": "11",
			"r": "8"
		}]]
	} }]));
}
//#endregion
//#region src/lib/components/ToolCard.svelte
function ToolCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { tool } = $$props;
		$$renderer.push(`<a${attr("href", `/tools/${stringify(tool.id)}`)} class="block h-full"${attr("id", `tool-card-${stringify(tool.id)}`)}><div class="card bg-base-100 shadow hover:shadow-lg transition-shadow border border-base-300 h-full"><div class="card-body gap-2"><div class="flex items-center justify-between gap-2"><h3 class="card-title text-lg">${escape_html(tool.name)}</h3> `);
		if (tool.icon) {
			$$renderer.push("<!--[0-->");
			if (tool.icon) {
				$$renderer.push("<!--[-->");
				tool.icon($$renderer, {
					class: "size-6 opacity-70",
					"aria-hidden": "true"
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <p class="text-sm opacity-80">${escape_html(tool.description)}</p> <div class="card-actions mt-2 flex items-center gap-2"><span class="badge badge-outline badge-sm capitalize">${escape_html(tool.category)}</span> `);
		StatusBadge($$renderer, { offlineCapable: tool.offlineCapable });
		$$renderer.push(`<!----></div></div></div></a>`);
	});
}
//#endregion
//#region src/lib/search/search.ts
/** Fields searched, with weights favoring the name. */
var KEYS = [
	{
		name: "name",
		weight: .5
	},
	{
		name: "keywords",
		weight: .3
	},
	{
		name: "description",
		weight: .2
	}
];
/**
* Search the tool catalog with fuzzy matching (Fuse.js).
* Returns matches ranked by score; an empty query returns all tools.
*/
function searchTools(query, tools) {
	const trimmed = query.trim();
	if (!trimmed) return tools;
	return new Fuse(tools, {
		keys: KEYS.map((k) => ({
			name: k.name,
			weight: k.weight
		})),
		threshold: .4,
		ignoreLocation: true,
		minMatchCharLength: 2
	}).search(trimmed).map((result) => result.item);
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let query = "";
		const results = derived(() => searchTools(query, tools));
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Civit — Browser tools &amp; converters</title>`);
			});
			$$renderer.push(`<meta name="description" content="Offline-first collection of browser-based converters and developer utilities."/>`);
		});
		$$renderer.push(`<div class="flex flex-col gap-8"><section class="text-center flex flex-col items-center gap-3"><h1 class="text-3xl font-extrabold tracking-tight">Civit</h1> <p class="max-w-xl opacity-80">Offline-first converters and developer utilities. Everything runs locally in your browser.</p> <label class="input input-bordered flex items-center gap-2 w-full max-w-md" for="tool-search">`);
		Search($$renderer, {
			class: "size-4 opacity-60",
			"aria-hidden": "true"
		});
		$$renderer.push(`<!----> <input type="search" id="tool-search" class="grow" placeholder="Search tools…"${attr("value", query)} aria-label="Search tools"/></label></section> <section aria-label="Tool catalog" id="tool-catalog">`);
		if (results().length === 0) $$renderer.push(`<!--[0--><p class="text-center opacity-70" role="status">No tools match “${escape_html(query)}”.</p>`);
		else {
			$$renderer.push(`<!--[-1--><ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0"><!--[-->`);
			const each_array = ensure_array_like(results());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tool = each_array[$$index];
				$$renderer.push(`<li class="h-full">`);
				ToolCard($$renderer, { tool });
				$$renderer.push(`<!----></li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		}
		$$renderer.push(`<!--]--></section></div>`);
	});
}
//#endregion
export { _page as default };
