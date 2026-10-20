<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { PAPER_SIZES, findPaperSize, formatDimensions } from './logic';
  import { Download } from '@lucide/svelte';

  export let meta: ToolMeta;

  let selected = $state<string>('A4');
  let rows = $state<PaperSize[]>(PAPER_SIZES);

  $effect(() => {
    selected = rows[0]?.id ?? 'A4';
  });

  function onSelect(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;
    selected = target.value;
    const size = findPaperSize(target.value);
    if (size) rows = [size];
  }

  function downloadCsv(): void {
    const header = 'Paper size,Width (mm),Height (mm),Aspect ratio';
    const lines = rows.map((s) => `${s.id},${s.widthMm},${s.heightMm},${s.aspect}`);
    downloadText('paper-sizes.csv', [header, ...lines].join('\n'));
  }

  function downloadText(filename: string, text: string): void {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }
</script>

<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </div>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <div class="flex flex-wrap gap-2 items-end">
        <label class="label cursor-pointer">
          <span>Filter:</span>
          <select class="select select-bordered select-sm" onchange={onSelect}>
            {#each GROUPED as group}
              {#each group.sizes as size (size.id)}
                <option value={size.id} selected={size.id === selected}>{size.id}</option>
              {/each}
            {/each}
          </select>
        </label>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Paper size</th>
              <th>Dimensions (mm)</th>
              <th>Aspect ratio</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as size (size.id)}
              <tr>
                <td class="font-mono">{size.id}</td>
                <td class="font-mono">{formatDimensions(size.widthMm, size.heightMm)}</td>
                <td class="font-mono">{size.aspect}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="flex gap-2">
        <button type="button" class="btn btn-sm btn-outline" onclick={downloadCsv}>
          <Download class="size-4 mr-1" aria-hidden="true" /> Download CSV
        </button>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  const GROUPED = [
    { label: 'ISO 216 (A/B/C)', sizes: ISO_PAPER_SIZES },
    { label: 'North America', sizes: NORTH_AMERICAN_SIZES },
    { label: 'Custom', sizes: CUSTOM_SIZES }
  ];

  import { ISO_PAPER_SIZES, NORTH_AMERICAN_SIZES, CUSTOM_SIZES } from './logic';
  import { downloadText } from '$lib/io/download';
</script>
