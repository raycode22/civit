// Not strictly required by @astrojs/svelte, but keeps editor tooling (svelte-check)
// aligned with the project's TypeScript + Vite preprocessing setup.
import { vitePreprocess } from '@astrojs/svelte';

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  preprocess: vitePreprocess(),
};
