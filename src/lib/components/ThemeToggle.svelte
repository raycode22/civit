<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { theme, type ThemeName } from '$lib/theme/theme.svelte';

	const icons: Record<ThemeName, typeof Sun> = {
		light: Sun,
		dark: Moon,
		system: Monitor
	};

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
	<svelte:component this={icons[$theme]} class="size-4" aria-hidden="true" />
	<span class="hidden sm:inline">{labels[$theme]}</span>
</button>
