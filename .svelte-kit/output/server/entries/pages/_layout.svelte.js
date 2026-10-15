import { C as attr, c as spread_props, d as unsubscribe_stores, l as store_get, u as stringify, w as escape_html } from "../../chunks/server.js";
import { n as writable } from "../../chunks/index-server2.js";
import { t as Icon } from "../../chunks/Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/monitor.svelte
function Monitor($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "monitor",
		"size": 24,
		"node": [
			["rect", {
				"width": "20",
				"height": "14",
				"x": "2",
				"y": "3",
				"rx": "2"
			}],
			["line", {
				"x1": "8",
				"x2": "16",
				"y1": "21",
				"y2": "21"
			}],
			["line", {
				"x1": "12",
				"x2": "12",
				"y1": "17",
				"y2": "21"
			}]
		]
	} }]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/moon.svelte
function Moon($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "moon",
		"size": 24,
		"node": [["path", { "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]]
	} }]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/sun.svelte
function Sun($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "sun",
		"size": 24,
		"node": [
			["circle", {
				"cx": "12",
				"cy": "12",
				"r": "4"
			}],
			["path", { "d": "M12 2v2" }],
			["path", { "d": "M12 20v2" }],
			["path", { "d": "m4.93 4.93 1.41 1.41" }],
			["path", { "d": "m17.66 17.66 1.41 1.41" }],
			["path", { "d": "M2 12h2" }],
			["path", { "d": "M20 12h2" }],
			["path", { "d": "m6.34 17.66-1.41 1.41" }],
			["path", { "d": "m19.07 4.93-1.41 1.41" }]
		]
	} }]));
}
function createThemeStore() {
	const { subscribe, set, update } = writable("system");
	return {
		subscribe,
		/** Set the theme preference, persist it, and apply it. */
		set(name) {
			setFn(name);
		},
		init() {},
		/** Cycle light -> dark -> system -> light. */
		toggle() {
			update((current) => {
				const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
				setFn(next);
				return next;
			});
		}
	};
	function setFn(name) {
		set(name);
	}
}
var theme = createThemeStore();
//#endregion
//#region src/lib/components/ThemeToggle.svelte
function ThemeToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const labels = {
			light: "Light theme",
			dark: "Dark theme",
			system: "System theme"
		};
		$$renderer.push(`<button type="button" class="btn btn-ghost btn-sm gap-2"${attr("aria-label", `Switch theme (current: ${stringify(store_get($$store_subs ??= {}, "$theme", theme))})`)} id="theme-toggle">`);
		if (store_get($$store_subs ??= {}, "$theme", theme) === "light") {
			$$renderer.push("<!--[0-->");
			Sun($$renderer, {
				class: "size-4",
				"aria-hidden": "true"
			});
		} else if (store_get($$store_subs ??= {}, "$theme", theme) === "dark") {
			$$renderer.push("<!--[1-->");
			Moon($$renderer, {
				class: "size-4",
				"aria-hidden": "true"
			});
		} else {
			$$renderer.push("<!--[-1-->");
			Monitor($$renderer, {
				class: "size-4",
				"aria-hidden": "true"
			});
		}
		$$renderer.push(`<!--]--> <span class="hidden sm:inline">${escape_html(labels[store_get($$store_subs ??= {}, "$theme", theme)])}</span></button>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		$$renderer.push(`<div class="min-h-dvh flex flex-col bg-base-100 text-base-content"><a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn btn-sm z-50">Skip to content</a> <header class="navbar border-b border-base-300 px-4 lg:px-8"><div class="flex-1"><a href="/" class="text-xl font-extrabold tracking-tight" id="brand">Civit</a></div> <div class="flex-none gap-2">`);
		ThemeToggle($$renderer, {});
		$$renderer.push(`<!----></div></header> <main id="main" class="flex-1 px-4 py-8 lg:px-8 max-w-6xl mx-auto w-full">`);
		children($$renderer);
		$$renderer.push(`<!----></main> <footer class="footer footer-center border-t border-base-300 p-4 text-sm opacity-70"><p>Civit — offline-first tools. Files never leave your device.</p></footer></div>`);
	});
}
//#endregion
export { _layout as default };
