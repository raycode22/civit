<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { enumerateGlyphs, UNICODE_RANGES, filterGlyphs, take } from './logic';
  import { Download } from '@lucide/svelte';
import { FontFace as FakeFontFace } from 'svelte/elements';

  export let meta: ToolMeta;

  // `FontFace` is a global in browsers but not in Node, so we alias the
  // Svelte test helper to the real global when available.
  const FontFace = globalThis.FontFace ?? FakeFontFace;

  let font = $state<string>('Arial, sans-serif');
  let rangeIndex = $state(0);
  let query = $state('');
  let glyphs = $state<Glyph[]>([]);
  let loading = $state(false);
  let error = $state('');
  let copied = $state(false);

  async function loadGlyphs(): Promise<void> {
    error = '';
    if (!font.trim()) {
      error = 'Enter a font family name.';
      return;
    }
    loading = true;
    try {
      const active = new FontFace(font, '64px "' + font + '"');
      const list = await enumerateGlyphs(active, UNICODE_RANGES, active);
      glyphs = filterGlyphs(list, query);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load font.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </div>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex-1 min-w-[180px]">
          <label for="font" class="label">Font family</label>
          <input
            id="font"
            bind:value={font}
            onkeydown={(e) => e.key === 'Enter' && loadGlyphs()}
            class="input input-bordered w-full"
            placeholder="e.g. Arial, sans-serif"
          />
        </div>
        <div>
          <label for="range" class="label">Unicode range</label>
          <select
            id="range"
            bind:value={rangeIndex}
            class="select select-bordered select-sm"
            onchange={loadGlyphs}
          >
            {#each UNICODE_RANGES as range, i (i)}
              <option value={i}>{range.label} (U+{range.start.toString(16).toUpperCase().padStart(4, '0')} – U+{range.end.toString(16).toUpperCase().padStart(4, '0')})</option>
            {/each}
          </select>
        </div>
        <div class="flex-1 min-w-[120px]">
          <label for="query" class="label">Search</label>
          <input
            id="query"
            bind:value={query}
            onkeydown={(e) => e.key === 'Enter' && loadGlyphs()}
            class="input input-bordered w-full"
            placeholder="Name or char"
          />
        </div>
        <button type="button" class="btn btn-primary" disabled={loading} onclick={loadGlyphs}>
          {loading ? 'Loading…' : 'Browse glyphs'}
        </button>
      </div>

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      {#if glyphs.length > 0}
        <div class="overflow-x-auto">
          <table class="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Char</th>
                <th>Name</th>
                <th>Advance (px)</th>
              </tr>
            </thead>
            <tbody>
              {#each take(glyphs, 120) as glyph (glyph.code)}
                <tr>
                  <td class="text-center">{glyph.char}</td>
                  <td class="font-mono text-xs opacity-70">{glyph.name}</td>
                  <td class="font-mono text-xs">{Math.round(glyph.advance)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="text-xs opacity-60">
          Showing {glyphs.length} glyphs; limited to first 120 above.
        </p>
      {/if}
    </div>
  </div>
</div>
