import { defineConfig } from 'vite-plus';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * [NEW] Build-time delivery target for the Docker/offline profile.
 *
 * `CIVIT_TARGET` is injected into client code via `define` below:
 * - `online` (default): bundled assets resolve to same-origin Pages-relative
 *   paths; ML model files resolve to the pinned Hugging Face Hub origin
 *   (D-03/D-04).
 * - `docker`: assets resolve to `/assets/...` local paths packaged in the image.
 *
 * Pass `--define CIVIT_TARGET=docker` (or set the env var) when building the
 * Docker profile. See `npm run build:docker`.
 */
const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env as Record<string, string | undefined> | undefined;

const CIVIT_TARGET =
  nodeEnv?.CIVIT_TARGET ?? (nodeEnv?.npm_config_civit_target as string | undefined) ?? 'online';

export default defineConfig({
  define: {
    'import.meta.env.CIVIT_TARGET': JSON.stringify(CIVIT_TARGET)
  },
  plugins: [tailwindcss(), sveltekit()],
  fmt: {
    ignorePatterns: [
      'build/**',
      '.svelte-kit/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      // Project documents are authored content, not code; preserve as-is.
      'docs/**'
    ],
    printWidth: 100,
    singleQuote: true,
    semi: true,
    trailingComma: 'none'
  },
  lint: {
    ignorePatterns: [
      'build/**',
      '.svelte-kit/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**'
    ],
    options: {
      typeAware: true,
      typeCheck: true
    }
  },
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts'],
    environment: 'node'
  }
});
