<script lang="ts">
	import { UploadCloud } from '@lucide/svelte';

	let {
		accept = 'image/*',
		disabled = false,
		onfile
	}: {
		accept?: string;
		disabled?: boolean;
		onfile: (file: File) => void;
	} = $props();

	let dragging = $state(false);
	let input: HTMLInputElement | undefined = $state();

	function handleFiles(files: FileList | null): void {
		const file = files?.[0];
		if (file) onfile(file);
	}

	function onDrop(event: DragEvent): void {
		dragging = false;
		if (disabled) return;
		handleFiles(event.dataTransfer?.files ?? null);
	}
</script>

<div
	role="button"
	tabindex="0"
	class="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
		{dragging ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200/50'}
		{disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}"
	aria-label="Drop an image here or click to browse"
	ondragover={(e) => {
		e.preventDefault();
		if (!disabled) dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
	onclick={() => !disabled && input?.click()}
	onkeydown={(e) => {
		if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
			e.preventDefault();
			input?.click();
		}
	}}
	id="file-drop-zone"
>
	<UploadCloud class="size-10 opacity-60" aria-hidden="true" />
	<p class="font-medium">Drop an image here</p>
	<p class="text-sm opacity-70">or click to browse — processing stays on your device</p>
	<input
		type="file"
		class="hidden"
		{accept}
		bind:this={input}
		onchange={(e) => handleFiles(e.currentTarget.files)}
	/>
</div>
