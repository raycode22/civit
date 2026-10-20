import { defineConfig } from 'vitest/config';

// Unit tests target pure TypeScript engines only at this stage (no DOM needed).
// Browser/e2e tests (Playwright) arrive with later phases per the build guide.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
