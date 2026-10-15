<script lang="ts">
	import type { Tool } from '$lib/tools/types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data }: { data: { tool: Tool } } = $props();
	const tool = data.tool;
</script>

<svelte:head>
	<title>{tool.name} — Civit</title>
	<meta name="description" content={tool.description} />
</svelte:head>

<nav aria-label="Breadcrumb" class="text-sm opacity-70 mb-6">
	<a href="/" class="link link-hover">← All tools</a>
</nav>

<tool.component />

{#if !tool.offlineCapable}
	<div class="alert alert-info mt-8 text-sm max-w-3xl mx-auto" role="status">
		This tool has not been verified for offline use yet.
	</div>
{/if}
