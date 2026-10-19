<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const credits = $derived(data.credits ?? '');
  const loaded = $derived(data.loaded ?? false);
</script>

<div class="max-w-3xl mx-auto w-full space-y-6">
  <h1 class="text-2xl font-bold">Credits &amp; licences</h1>
  <p class="opacity-80">
    Third-party libraries, fonts, WASM builds, and ML models shipped or fetched
    by Civit, per Constitution §17 and PRD FR-35.
  </p>

  {#if loaded}
    <div class="prose prose-sm max-w-none" style="white-space: pre-wrap; font-family: ui-sans-serif, system-ui, sans-serif;">
      {@html credits}
    </div>
  {:else}
    <p class="text-sm opacity-70">Loading credits…</p>
  {/if}

  <p class="text-xs opacity-60 mt-4">
    The Docker/offline localisation register is maintained in
    <code>docs/04-OFFLINE-FIRST-DECISIONS.md</code>.
  </p>
</div>
