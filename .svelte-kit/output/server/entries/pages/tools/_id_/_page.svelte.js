import { C as attr, o as head, r as derived, w as escape_html } from "../../../../chunks/server.js";
//#region src/routes/tools/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const tool = derived(() => data.tool);
		head("bmmpf0", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(tool().name)} — Civit</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", tool().description)}/>`);
		});
		$$renderer.push(`<nav aria-label="Breadcrumb" class="text-sm opacity-70 mb-6"><a href="/" class="link link-hover">← All tools</a></nav> `);
		if (tool().component) {
			$$renderer.push("<!--[-->");
			tool().component($$renderer, {});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(` `);
		if (!tool().offlineCapable) $$renderer.push(`<!--[0--><div class="alert alert-info mt-8 text-sm max-w-3xl mx-auto" role="status">This tool has not been verified for offline use yet.</div>`);
		else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
