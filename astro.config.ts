// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// Civit — static-first foundation (Phase 1 / Prompt 1A).
// No server adapter, no PWA plugin, no Cloudflare-specific config: the output
// must stay portable to any static host and the later Docker/Nginx image.
// See docs/decisions/0001-static-first.md.
export default defineConfig({
  output: 'static',
  site: 'https://civit.example', // placeholder origin for canonical URLs until a domain is decided
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
