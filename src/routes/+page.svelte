<script lang="ts">
	import { Search } from '@lucide/svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { searchTools } from '$lib/search/search';
	import { tools } from '$lib/tools/registry';

	let query = $state('');
	const results = $derived(searchTools(query, tools));
</script>

<svelte:head>
	<title>Civit — Browser tools & converters</title>
	<meta name="description" content="Offline-first collection of browser-based converters and developer utilities." />
</svelte:head>

<div class="flex flex-col gap-8">
	<section class="text-center flex flex-col items-center gap-3">
		<h1 class="text-3xl font-extrabold tracking-tight">Civit</h1>
		<p class="max-w-xl opacity-80">
			Offline-first converters and developer utilities. Everything runs locally in your browser.
		</p>
		<label class="input input-bordered flex items-center gap-2 w-full max-w-md" for="tool-search">
			<Search class="size-4 opacity-60" aria-hidden="true" />
			<input
				type="search"
				id="tool-search"
				class="grow"
				placeholder="Search tools…"
				bind:value={query}
				aria-label="Search tools"
			/>
		</label>
	</section>

	<section aria-label="Tool catalog" id="tool-catalog">
		{#if results.length === 0}
			<p class="text-center opacity-70" role="status">No tools match “{query}”.</p>
		{:else}
			<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
				{#each results as tool (tool.id)}
					<li class="h-full">
						<ToolCard {tool} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
