import { test, expect, type Page } from '@playwright/test';

/**
 * [Stage 9A, FR-30] Network-disabled verification runs for every tool that
 * carries `offline: 'full'`.
 *
 * Each test warms the service-worker cache while online, then disables all
 * networking for the browser context (`context.setOffline(true)`), reloads
 * the tool route, and exercises the tool end to end. A tool's `offline`
 * registry value may only be `full` while it passes here (recorded run).
 *
 * The suite runs against the production build served by `vp preview`. For
 * the Docker profile, run `npm run build:docker` first and start
 * `npx vp preview --port 4173` manually so Playwright reuses the existing
 * server (`reuseExistingServer` is enabled outside CI).
 */

/** Committed upload fixture (1x1 px PNG), relative to the repository root. */
const PNG_FIXTURE = 'tests/e2e/fixtures/pixel.png';

/**
 * Wait until the service worker is installed, active, AND has claimed the
 * current page.
 *
 * `registration.active` alone is not enough: it can be observed while the
 * `clients.claim()` from the activate handler is still pending. An unclaimed
 * page's navigation and subresources bypass the worker, so nothing gets
 * written to the runtime cache and the later offline reload falls back to
 * the precached shell — which intermittently broke offline runs during the
 * Stage 9A verification (recorded evidence: `controller:false, runtime:[]`).
 */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    () => navigator.serviceWorker.getRegistration().then((r) => !!r?.active),
    null,
    { timeout: 30_000 }
  );
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, {
    timeout: 30_000
  });
}

/**
 * Warm the runtime cache for a tool route while online, then take the
 * context offline and reload the route.
 *
 * The heading wait is required: it proves the tool's lazy chunk finished
 * loading (and was cached by the service worker) before networking is
 * disabled, so the offline reload cannot race the chunk download.
 */
async function goOfflineOn(
  page: Page,
  context: import('@playwright/test').BrowserContext,
  path: string,
  recordedErrors: string[]
): Promise<void> {
  await page.goto('/');
  await waitForServiceWorker(page);
  await page.goto(path);
  await expect(page.locator('main h2').first()).toBeVisible();
  // Observe whether the online tool navigation itself was SW-controlled and
  // stored in the runtime cache (evidence for the offline-run record).
  const online = await page.evaluate(async (toolPath) => {
    const runtime: string[] = [];
    for (const name of await caches.keys()) {
      if (!name.startsWith('civit-runtime')) continue;
      const c = await caches.open(name);
      for (const req of await c.keys()) {
        if (req.url.endsWith(toolPath)) runtime.push(`${name} :: ${req.url}`);
      }
    }
    return { controller: !!navigator.serviceWorker?.controller, runtime };
  }, path);
  console.log('[online phase]', JSON.stringify(online));
  await context.setOffline(true);
  await page.reload().catch(() => undefined);
  const h2 = page.locator('main h2').first();
  const booted = await h2
    .waitFor({ state: 'visible', timeout: 4000 })
    .then(() => true)
    .catch(() => false);
  if (!booted || recordedErrors.length > 0) {
    // Diagnostic dump: each probe is isolated so one throwing access (e.g. a
    // Chromium error page with a blocked origin) cannot null the whole dump.
    const info = await page.evaluate(async () => {
      const pick = async <T>(fn: () => T | Promise<T>): Promise<T | string> => {
        try {
          return await fn();
        } catch (e) {
          return `ERR:${(e as Error).message}`;
        }
      };
      return {
        href: await pick(() => location.href),
        title: await pick(() => document.title),
        bodyText: await pick(() => document.body?.innerText.slice(0, 200) ?? '(no body)'),
        docBoot: await pick(
          () =>
            document.documentElement.innerHTML.match(/import\("([^"]*entry\/start[^"]*)"\)/)?.[1] ??
            null
        ),
        controller: await pick(() => !!navigator.serviceWorker?.controller),
        entries: await pick(async () => {
          const out: string[] = [];
          for (const name of await caches.keys()) {
            const c = await caches.open(name);
            for (const req of await c.keys()) {
              if (!/tools|index\.html|credits/.test(req.url)) continue;
              const res = await c.match(req);
              const text = res ? await res.clone().text() : '';
              const boot = text.match(/import\("([^"]*entry\/start[^"]*)"\)/)?.[1] ?? '(none)';
              out.push(`${name} :: ${req.url} :: ${boot}`);
            }
          }
          return out;
        })
      };
    });
    throw new Error(
      `offline reload did not boot (booted=${booted}, errors=${JSON.stringify(recordedErrors)}): ` +
        JSON.stringify(info, null, 2)
    );
  }
}

/**
 * Record uncaught page errors and non-GET requests attempted during an
 * offline run. Errors are collected (not thrown) so the boot-diagnostic dump
 * in goOfflineOn can include them when the reload fails.
 */
function failFastOffline(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('request', (req) => {
    if (req.method() !== 'GET') errors.push(`non-GET: ${req.url()}`);
  });
  return errors;
}

test('base64-image-encoder runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/base64-image-encoder', errors);
  await expect(page.getByRole('heading', { name: 'Base64 Image Encoder' })).toBeVisible();
  await page.setInputFiles('#file-drop-zone input[type="file"]', PNG_FIXTURE);
  await expect(page.locator('#encoder-output')).toBeVisible();
  const value = await page.locator('#encoder-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('px-to-rem runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/px-to-rem', errors);
  await expect(page.getByRole('heading', { name: 'PX to REM' })).toBeVisible();
  await page.locator('#px').fill('16');
  await page.getByRole('button', { name: 'PX → REM' }).click();
  await expect(page.locator('.alert-info .font-mono')).toContainText('1 rem');
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('word-counter runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/word-counter', errors);
  await expect(page.getByRole('heading', { name: 'Word Counter' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Text to count' }).fill('One two three. Four five.');
  await expect(page.locator('.stat-value').first()).toHaveText('5');
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('favicon-generator runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/favicon-generator', errors);
  await expect(page.getByRole('heading', { name: 'Favicon Generator' })).toBeVisible();
  await page.locator('#name').fill('CN');
  await page.getByRole('button', { name: /Generate/ }).click();
  const preview = page.locator('.favicon-preview img');
  await expect(preview).toBeVisible();
  expect(await preview.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
  await expect(page.getByRole('button', { name: /Download PNG/ })).toBeVisible();
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('image-clipper runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/image-clipper', errors);
  await expect(page.getByRole('heading', { name: 'Image Clipper' })).toBeVisible();
  await page.setInputFiles('#input', PNG_FIXTURE);
  await page.getByRole('button', { name: /Clip and export/ }).click();
  await expect(page.getByRole('button', { name: /Download PNG/ })).toBeVisible();
  await expect(page.getByText('Result:', { exact: false })).toBeVisible();
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('metadata-stripper runs with the network disabled (FR-30)', async ({ page, context }) => {
  const errors = failFastOffline(page);
  await goOfflineOn(page, context, '/tools/metadata-stripper', errors);
  await expect(page.getByRole('heading', { name: 'Metadata Stripper' })).toBeVisible();
  await page.setInputFiles('#file-drop-zone input[type="file"]', PNG_FIXTURE);
  await expect(page.locator('#stripper-output')).toBeVisible();
  const value = await page.locator('#stripper-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});
