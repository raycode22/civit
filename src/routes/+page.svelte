<script lang="ts">
	import { Search } from '@lucide/svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { searchTools } from '$lib/search/search';
	import { tools } from '$lib/tools/registry';
	import { TOOL_CATEGORIES, CATEGORY_LABELS, groupToolsByCategory } from '$lib/tools/categories';
	import type { ToolCategory, OfflineSupport } from '$lib/tools/types';

	let query = $state('');
	// [NEW] Category filter and "works offline" filter (PRD FR-23).
	let categoryFilter = $state<ToolCategory | ''>('');
	let offlineOnly = $state(false);

	const results = $derived(
		searchTools(query, tools, { category: categoryFilter || null, offlineOnly })
	);
	// [NEW] Sidebar groups plus category-ordered card grid (PRD FR-22).
	const groups = $derived(groupToolsByCategory(results));
	const orderedResults = $derived(groups.flatMap((group) => group.tools));

	function onCategoryChange(event: Event): void {
		categoryFilter = (event.currentTarget as HTMLSelectElement).value as ToolCategory | '';
	}

	// Compact offline labels for the sidebar (the cards show the full badges).
	const SIDEBAR_OFFLINE_LABEL: Record<OfflineSupport, string> = {
		full: 'Offline',
		partial: 'Partial',
		'online-only': 'Online'
	};
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
		<!-- [NEW] Filters compose with search (PRD FR-23). -->
		<div class="flex items-center gap-4 flex-wrap justify-center">
			<label class="flex items-center gap-2 text-sm" for="category-filter">
				<span class="opacity-70">Category</span>
				<select
					id="category-filter"
					class="select select-bordered select-sm"
					value={categoryFilter}
					onchange={onCategoryChange}
				>
					<option value="">All categories</option>
					{#each TOOL_CATEGORIES as cat (cat)}
						<option value={cat}>{CATEGORY_LABELS[cat]}</option>
					{/each}
				</select>
			</label>
			<label class="label cursor-pointer gap-2 py-0" for="offline-filter">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					id="offline-filter"
					bind:checked={offlineOnly}
				/>
				<span class="label-text text-sm">Works offline</span>
			</label>
		</div>
	</section>

	<div class="flex flex-col lg:flex-row gap-8 items-start">
		<!-- [NEW] Sidebar grouped by category with status/offline badges (PRD FR-22). -->
		<aside id="tool-sidebar" aria-label="Tools by category" class="lg:w-64 shrink-0 w-full">
			{#if groups.length > 0}
				<div class="flex flex-col gap-4">
					{#each groups as group (group.category)}
						<nav aria-label={group.label}>
							<h2 class="text-sm font-bold uppercase tracking-wide opacity-60 mb-2">
								{group.label}
							</h2>
							<ul class="list-none p-0 m-0 flex flex-col gap-1">
								{#each group.tools as tool (tool.id)}
									<li>
										<a
											href="/tools/{tool.id}"
											class="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-base-200 text-sm"
										>
											<span class="truncate">{tool.name}</span>
											<span class="flex gap-1 shrink-0">
												<span class="badge badge-ghost badge-xs" title={tool.status}>{tool.status}</span>
												<span
													class="badge badge-xs {tool.offline === 'full'
														? 'badge-success'
														: tool.offline === 'partial'
															? 'badge-warning'
															: 'badge-neutral'}"
													title={SIDEBAR_OFFLINE_LABEL[tool.offline]}
												>
													{SIDEBAR_OFFLINE_LABEL[tool.offline]}
												</span>
											</span>
										</a>
									</li>
								{/each}
							</ul>
						</nav>
					{/each}
				</div>
			{:else}
				<p class="text-sm opacity-70">No categories match the current filters.</p>
			{/if}
		</aside>

		<section aria-label="Tool catalog" id="tool-catalog" class="flex-1 w-full">
			{#if orderedResults.length === 0}
				<p class="text-center opacity-70" role="status">
					{query.trim() ? `No tools match “${query}”.` : 'No tools match the current filters.'}
				</p>
			{:else}
				<ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
					{#each orderedResults as tool (tool.id)}
						<li class="h-full">
							<ToolCard {tool} />
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>
