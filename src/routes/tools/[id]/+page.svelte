<script lang="ts">
	import type { Component } from 'svelte';
	import type { Tool } from '$lib/tools/types';

	let { data }: { data: { tool: Tool } } = $props();
	// Derived so it stays reactive if load() re-runs (e.g. param change).
	const tool = $derived(data.tool);

	// [REVISED] Tools are lazy-loaded (PRD FR-24): the registry entry exposes
	// a dynamic-import loader, fetched only when this route opens.
	let ToolComponent = $state<Component | null>(null);
	let loadFailed = $state(false);

	$effect(() => {
		const loader = tool.component;
		let cancelled = false;
		ToolComponent = null;
		loadFailed = false;
		loader().then(
			(mod) => {
				if (!cancelled) ToolComponent = mod.default;
			},
			() => {
				if (!cancelled) loadFailed = true;
			}
		);
		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>{tool.name} — Civit</title>
	<meta name="description" content={tool.description} />
</svelte:head>

<nav aria-label="Breadcrumb" class="text-sm opacity-70 mb-6">
	<a href="/" class="link link-hover">← All tools</a>
</nav>

{#if ToolComponent}
	<ToolComponent />
{:else if loadFailed}
	<div class="alert alert-error text-sm max-w-3xl" role="alert">
		This tool could not be loaded. If you are offline, reconnect once so its code can be
		cached, then try again.
	</div>
{:else}
	<span class="opacity-70 text-sm" aria-live="polite">Loading tool…</span>
{/if}

{#if tool.offline === 'online-only'}
	<div class="alert alert-info mt-8 text-sm max-w-3xl mx-auto" role="status">
		This tool has not been verified for offline use yet.
	</div>
{:else if tool.offline === 'partial'}
	<div class="alert alert-info mt-8 text-sm max-w-3xl mx-auto" role="status">
		This tool's core functions run offline; some assets may need a one-time download.
	</div>
{/if}
