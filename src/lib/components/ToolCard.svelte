<script lang="ts">
	import type { ToolMeta } from '$lib/tools/types';
	import StatusBadge from './StatusBadge.svelte';

	let { tool }: { tool: ToolMeta } = $props();
</script>

<a href="/tools/{tool.id}" class="block h-full" id="tool-card-{tool.id}">
	<div
		class="card bg-base-100 shadow hover:shadow-lg transition-shadow border border-base-300 h-full"
	>
		<div class="card-body gap-2">
			<div class="flex items-center justify-between gap-2">
				<h3 class="card-title text-lg">{tool.name}</h3>
				{#if tool.icon}
					<svelte:component this={tool.icon} class="size-6 opacity-70" aria-hidden="true" />
				{/if}
			</div>
			<p class="text-sm opacity-80">{tool.description}</p>
			<div class="card-actions mt-2 flex items-center gap-2">
				<span class="badge badge-outline badge-sm capitalize">{tool.category}</span>
				<StatusBadge offlineCapable={tool.offlineCapable} />
			</div>
		</div>
	</div>
</a>
