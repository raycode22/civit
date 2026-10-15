import { defineConfig } from 'vite-plus';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  fmt: {
    ignorePatterns: ['build/**', '.svelte-kit/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
    printWidth: 100,
    singleQuote: true,
    semi: true,
    trailingComma: 'none'
  },
  lint: {
    ignorePatterns: ['build/**', '.svelte-kit/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
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
