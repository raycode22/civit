<script lang="ts">
  // Civit home-page tool search — Prompt 2A.
  // Svelte 5 island over the pure search logic (src/lib/search/toolSearch.ts).
  // Local-only: no network requests, no analytics. Results link only to
  // published (implemented) tools; planned tools are never shown as usable.
  import { searchTools, type SearchResult } from '../lib/search/toolSearch';
  import { toolPath } from '../lib/tools/routes';
  import type { ToolMetadata } from '../lib/tools/types';

  let { candidates }: { candidates: ToolMetadata[] } = $props();

  let query = $state('');
  let results: SearchResult[] = $derived(searchTools(query, candidates));

  function clear(): void {
    query = '';
  }
</script>

<form class="flex flex-col gap-3" onsubmit={(e) => e.preventDefault()}>
  <label class="text-sm font-medium" for="tool-search">Search tools</label>
  <div class="flex gap-2">
    <input
      id="tool-search"
      type="search"
      class="input input-primary w-full"
      placeholder="Try “json”, “format”, “developer”…"
      autocomplete="off"
      bind:value={query}
    />
    {#if query}
      <button type="button" class="btn btn-neutral btn-sm shrink-0" onclick={clear}>Clear</button>
    {/if}
  </div>

  <!-- Concise, polite status — never colour-only meaning. -->
  <p class="sr-only" role="status" aria-live="polite">
    {#if query.trim() === ''}
      Type a search term to filter available tools.
    {:else if results.length === 0}
      No matching tools found.
    {:else}
      {results.length} {results.length === 1 ? 'tool' : 'tools'} found.
    {/if}
  </p>

  {#if query.trim() !== '' && results.length === 0}
    <!-- Explicit empty-search state (Prompt 2A requirement). -->
    <div class="alert alert-neutral" role="note">
      <span>
        No tools match “{query}”. Only implemented tools are searchable — see
        <a href="/tools/" class="link link-primary">all planned tools</a>.
      </span>
    </div>
  {:else if results.length > 0}
    <ul class="flex flex-col gap-2">
      {#each results as { tool }}
        <li class="card border border-[var(--civit-border-subtle)] bg-base-200">
          <div class="card-body gap-1 p-4">
            <h3 class="card-title text-base">
              <a href={toolPath(tool.slug)} class="link link-primary">{tool.name}</a>
            </h3>
            <p class="text-sm text-[var(--civit-subtext-1)]">{tool.shortDescription}</p>
            <span class="badge badge-primary badge-soft capitalize normal-case mt-1">{tool.category}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</form>
