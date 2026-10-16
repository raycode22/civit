<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { theme, type ThemeName } from '$lib/theme/theme.svelte';

	const labels: Record<ThemeName, string> = {
		light: 'Light theme',
		dark: 'Dark theme',
		system: 'System theme'
	};

	function next(): void {
		theme.toggle();
	}
</script>

<button
	type="button"
	class="btn btn-ghost btn-sm gap-2"
	onclick={next}
	aria-label="Switch theme (current: {$theme})"
	id="theme-toggle"
>
	{#if $theme === "light"}
	<Sun class="size-4" aria-hidden="true" />
{:else if $theme === "dark"}
	<Moon class="size-4" aria-hidden="true" />
{:else}
	<Monitor class="size-4" aria-hidden="true" />
{/if}
	<span class="hidden sm:inline">{labels[$theme]}</span>
</button>
