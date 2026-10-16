<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { theme } from '$lib/theme/theme.svelte';

	let { children }: { children: Snippet } = $props();

	// Initialize theme once in the browser (reads localStorage + system pref).
	$effect(() => {
		theme.init();
	});
</script>

<div class="min-h-dvh flex flex-col bg-base-100 text-base-content">
	<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn btn-sm z-50">
		Skip to content
	</a>
	<header class="navbar border-b border-base-300 px-4 lg:px-8">
		<div class="flex-1">
			<a href="/" class="text-xl font-extrabold tracking-tight" id="brand">Civit</a>
		</div>
		<div class="flex-none gap-2">
			<ThemeToggle />
		</div>
	</header>

	<main id="main" class="flex-1 px-4 py-8 lg:px-8 max-w-6xl mx-auto w-full">
		{@render children()}
	</main>

	<footer class="footer footer-center border-t border-base-300 p-4 text-sm opacity-70">
		<p>Civit — offline-first tools. Files never leave your device.</p>
	</footer>
</div>
