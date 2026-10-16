import { n as onDestroy } from "./index-server.js";
import { C as attr, c as spread_props, t as attr_class, u as stringify, w as escape_html } from "./server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/cloud-upload.svelte
function Cloud_upload($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "cloud-upload",
		"size": 24,
		"node": [
			["path", { "d": "M12 13v8" }],
			["path", { "d": "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }],
			["path", { "d": "m8 17 4-4 4 4" }]
		],
		"aliases": ["upload-cloud"]
	} }]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/copy.svelte
function Copy($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "copy",
		"size": 24,
		"node": [["rect", {
			"width": "14",
			"height": "14",
			"x": "8",
			"y": "8",
			"rx": "2",
			"ry": "2"
		}], ["path", { "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]]
	} }]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/image-up.svelte
function Image_up($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "image-up",
		"size": 24,
		"node": [
			["path", { "d": "M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" }],
			["path", { "d": "m14 19.5 3-3 3 3" }],
			["path", { "d": "M17 22v-5.5" }],
			["circle", {
				"cx": "9",
				"cy": "9",
				"r": "2"
			}]
		]
	} }]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/wifi-off.svelte
function Wifi_off($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([props, { icon: {
		"name": "wifi-off",
		"size": 24,
		"node": [
			["path", { "d": "M12 20h.01" }],
			["path", { "d": "M8.5 16.429a5 5 0 0 1 7 0" }],
			["path", { "d": "M5 12.859a10 10 0 0 1 5.17-2.69" }],
			["path", { "d": "M19 12.859a10 10 0 0 0-2.007-1.523" }],
			["path", { "d": "M2 8.82a15 15 0 0 1 4.177-2.643" }],
			["path", { "d": "M22 8.82a15 15 0 0 0-11.288-3.764" }],
			["path", { "d": "m2 2 20 20" }]
		]
	} }]));
}
//#endregion
//#region src/lib/components/StatusBadge.svelte
function StatusBadge($$renderer, $$props) {
	let { offlineCapable } = $$props;
	$$renderer.push(`<span${attr_class(`badge badge-sm gap-1 ${offlineCapable ? "badge-success" : "badge-neutral"}`)}${attr("title", offlineCapable ? "Works offline once cached" : "Requires network for first load")} role="status"><span aria-hidden="true">${escape_html(offlineCapable ? "⚡" : "🌐")}</span> ${escape_html(offlineCapable ? "Offline ready" : "Online")}</span>`);
}
//#endregion
//#region src/lib/tools/base64-image-encoder/meta.ts
var meta = {
	id: "base64-image-encoder",
	name: "Base64 Image Encoder",
	description: "Convert an image file into a Base64 data URI, entirely in your browser.",
	keywords: [
		"base64",
		"image",
		"data uri",
		"encode",
		"decoder",
		"dataurl"
	],
	category: "encoder",
	offlineCapable: true,
	icon: Image_up
};
//#endregion
//#region src/lib/components/FileDropZone.svelte
function FileDropZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { accept = "image/*", disabled = false, onfile } = $$props;
		$$renderer.push(`<div role="button" tabindex="0"${attr_class(`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer border-base-300 bg-base-200/50 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}`)} aria-label="Drop an image here or click to browse" id="file-drop-zone">`);
		Cloud_upload($$renderer, {
			class: "size-10 opacity-60",
			"aria-hidden": "true"
		});
		$$renderer.push(`<!----> <p class="font-medium">Drop an image here</p> <p class="text-sm opacity-70">or click to browse — processing stays on your device</p> <input type="file" class="hidden"${attr("accept", accept)}/></div>`);
	});
}
//#endregion
//#region src/lib/tools/base64-image-encoder/logic.ts
/**
* Pure logic for the Base64 image encoder tool.
* Kept free of DOM/browser APIs so it is unit-testable in Node.
*/
/** Maximum accepted image size (10 MiB) to keep encoding responsive. */
var MAX_FILE_BYTES = 10485760;
/** MIME types this encoder accepts. */
var ACCEPTED_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/avif",
	"image/bmp"
];
/** Validate an image candidate before reading it. */
function validateImage(file) {
	if (file.size === 0) return { code: "empty" };
	if (file.size > 10485760) return {
		code: "too-large",
		bytes: file.size
	};
	const mime = file.type || inferMimeFromName("");
	if (!mime || !ACCEPTED_MIME_TYPES.includes(mime)) return {
		code: "unsupported-type",
		mime: file.type || "unknown"
	};
	return null;
}
/** Best-effort MIME inference from a data URI prefix (used by tests/Node). */
function inferMimeFromName(name) {
	switch (name.split(".").pop()?.toLowerCase() ?? "") {
		case "png": return "image/png";
		case "jpg":
		case "jpeg": return "image/jpeg";
		case "gif": return "image/gif";
		case "webp": return "image/webp";
		case "svg": return "image/svg+xml";
		case "avif": return "image/avif";
		case "bmp": return "image/bmp";
		default: return "";
	}
}
/**
* Convert raw Base64 payload plus MIME type into a data URI.
* Input must be Base64 without whitespace or a data-URI prefix.
*/
function buildDataUri(mime, base64) {
	const cleaned = base64.replace(/\s+/g, "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) throw new Error("Invalid Base64 payload");
	return {
		dataUri: `data:${mime};base64,${cleaned}`,
		sizeBase64: cleaned.length
	};
}
/**
* Encode binary content (Node Buffer / Uint8Array / ArrayBuffer) into a
* Base64 data URI. Used by the UI via FileReader results and by tests.
*/
function encodeBytes(mime, bytes) {
	const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < view.length; i += chunk) binary += String.fromCharCode(...view.subarray(i, i + chunk));
	return buildDataUri(mime, btoa(binary));
}
/** Human-readable byte size, e.g. `1.2 MB`. */
function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	const units = [
		"KB",
		"MB",
		"GB"
	];
	let value = bytes;
	let unit = "B";
	for (const u of units) {
		value = value / 1024;
		unit = u;
		if (value < 1024) break;
	}
	return `${value.toFixed(value >= 100 ? 0 : 1)} ${unit}`;
}
//#endregion
//#region src/lib/tools/base64-image-encoder/Tool.svelte
function Tool($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let error = null;
		let result = null;
		let fileName = "";
		let online = true;
		function describeError(err) {
			if (!err) return "";
			switch (err.code) {
				case "empty": return "That file is empty.";
				case "too-large": return `File is too large (${formatBytes(err.bytes)}). Maximum is ${formatBytes(MAX_FILE_BYTES)}.`;
				case "unsupported-type": return `Unsupported file type: ${err.mime}. Please choose a PNG, JPEG, GIF, WebP, SVG, AVIF, or BMP image.`;
			}
		}
		function handleFile(file) {
			error = null;
			result = null;
			const invalid = validateImage(file);
			if (invalid) {
				error = describeError(invalid);
				return;
			}
			fileName = file.name;
			const reader = new FileReader();
			reader.onerror = () => error = "Could not read the file. Please try again.";
			reader.onload = () => {
				try {
					const buffer = reader.result;
					result = encodeBytes(file.type, new Uint8Array(buffer));
				} catch (e) {
					error = e instanceof Error ? e.message : "Encoding failed.";
				}
			};
			reader.readAsArrayBuffer(file);
		}
		const setOnline = () => online = true;
		const setOffline = () => online = false;
		onDestroy(() => {
			window.removeEventListener("online", setOnline);
			window.removeEventListener("offline", setOffline);
		});
		$$renderer.push(`<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full"><div class="flex items-center justify-between gap-4"><h2 class="text-2xl font-bold">${escape_html(meta.name)}</h2> `);
		StatusBadge($$renderer, { offlineCapable: meta.offlineCapable });
		$$renderer.push(`<!----></div> <p class="opacity-80 -mt-4">${escape_html(meta.description)}</p> `);
		if (!online) {
			$$renderer.push(`<!--[0--><div class="alert alert-warning flex items-center gap-2 text-sm" role="status" id="offline-indicator">`);
			Wifi_off($$renderer, {
				class: "size-4 shrink-0",
				"aria-hidden": "true"
			});
			$$renderer.push(`<!----> You are offline. This tool runs entirely in your browser and keeps working.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		FileDropZone($$renderer, { onfile: handleFile });
		$$renderer.push(`<!----> `);
		if (error) $$renderer.push(`<!--[0--><div class="alert alert-error text-sm" role="alert" id="encoder-error">${escape_html(error)}</div>`);
		else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (result) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-2" id="encoder-output"><div class="flex items-center justify-between"><h3 class="font-semibold">Data URI (${escape_html(fileName)}, ${escape_html(formatBytes(result.sizeBase64))} encoded)</h3> <button type="button" class="btn btn-sm gap-1" id="copy-button">`);
			$$renderer.push("<!--[-1-->");
			Copy($$renderer, {
				class: "size-4",
				"aria-hidden": "true"
			});
			$$renderer.push(`<!----> Copy`);
			$$renderer.push(`<!--]--></button></div> <textarea readonly="" class="textarea textarea-bordered font-mono text-xs h-40 w-full" aria-label="Base64 data URI output" id="encoder-output-text">`);
			const $$body = escape_html(result.dataUri);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea> <div class="flex items-center gap-4"><img${attr("src", result.dataUri)}${attr("alt", `Preview of ${stringify(fileName)}`)} class="max-h-40 rounded border"/></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/lib/tools/registry.ts
/**
* Central tool registry. Adding a tool means registering its metadata and
* component here; the catalog, search index, and `/tools/[id]` routes pick
* it up automatically.
*/
var tools = [{
	...meta,
	component: Tool
}];
/** Look up a tool by its route id. */
function getTool(id) {
	return tools.find((tool) => tool.id === id);
}
//#endregion
export { tools as n, StatusBadge as r, getTool as t };
