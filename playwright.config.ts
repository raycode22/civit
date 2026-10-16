import { defineConfig, devices } from '@playwright/test';

// Node globals without requiring @types/node (kept out of the app's dependency set).
const ci = !!(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  ?.CI;

/**
 * E2E smoke tests run against the production build served by `vp preview`.
 * The webServer command was verified against the installed vite-plus CLI
 * (`npx vp preview --help` shows --port and --strictPort).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npx vp preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !ci,
    timeout: 180_000
  }
});
