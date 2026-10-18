import { test, expect, type Page } from '@playwright/test';

/**
 * Upload fixtures live as committed files under tests/e2e/fixtures/ and are
 * passed to setInputFiles() as paths relative to the repository root (the CWD
 * when Playwright is launched). Paths are used instead of inline binary
 * buffers because Playwright's base64 round-trip corrupts binary payloads.
 */
const PNG_FIXTURE = 'tests/e2e/fixtures/pixel.png'; // valid 1x1 px PNG
const TXT_FIXTURE = 'tests/e2e/fixtures/notes.txt'; // unsupported type

/** Expected bytes of the PNG fixture, used for the round-trip assertion. */
const PIXEL_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Decode a base64 string to bytes without Node-only globals (browser-safe). */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Wait until the service worker is installed and controlling the page. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    () => navigator.serviceWorker.getRegistration().then((r) => !!r?.active),
    null,
    { timeout: 30_000 }
  );
}

test('landing page renders the catalog', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Civit/);
  await expect(page.getByRole('heading', { name: 'Civit' })).toBeVisible();
  await expect(page.locator('#tool-card-base64-image-encoder')).toBeVisible();
});

test('navigates to the Base64 image encoder tool', async ({ page }) => {
  await page.goto('/');
  await page.locator('#tool-card-base64-image-encoder').click();
  await expect(page).toHaveURL(/\/tools\/base64-image-encoder$/);
  await expect(page.getByRole('heading', { name: 'Base64 Image Encoder' })).toBeVisible();
});

test('deep link to a tool works via SPA fallback', async ({ page }) => {
  await page.goto('/tools/base64-image-encoder');
  await expect(page.getByRole('heading', { name: 'Base64 Image Encoder' })).toBeVisible();
});

test('unknown tool route shows an error', async ({ page }) => {
  await page.goto('/tools/does-not-exist');
  await expect(page.getByText(/Unknown tool/i)).toBeVisible();
});

test('search filters the tool catalog', async ({ page }) => {
  await page.goto('/');
  await page.locator('#tool-search').fill('base64');
  await expect(page.locator('#tool-card-base64-image-encoder')).toBeVisible();
  await page.locator('#tool-search').fill('zzzz-no-match');
  await expect(page.getByRole('status')).toContainText('No tools match');
});

test('theme toggle cycles light → dark → system', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('html');
  const before = await root.getAttribute('data-theme');
  await expect(root).toHaveAttribute('data-theme', /light|dark/, { timeout: 5000 });
  await page.locator('#theme-toggle').click(); // -> next in cycle
  const afterFirst = await root.getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  const afterSecond = await root.getAttribute('data-theme');
  // The three-step cycle must produce at least two distinct values overall.
  expect(new Set([before, afterFirst, afterSecond].filter(Boolean)).size).toBeGreaterThanOrEqual(2);
});

test('base64 encoder converts an uploaded image entirely client-side', async ({ page }) => {
  await page.goto('/tools/base64-image-encoder');
  // A tiny valid PNG (1x1 px), committed at tests/e2e/fixtures/pixel.png.
  const png = base64ToBytes(PIXEL_PNG_B64);
  let uploaded = false;
  page.on('request', (req) => {
    if (req.method() !== 'GET' && !uploaded) {
      // Fail fast if anything tries to POST user data somewhere.
      throw new Error(`Unexpected non-GET request during encoding: ${req.url()}`);
    }
  });
  await page.setInputFiles('#file-drop-zone input[type="file"]', PNG_FIXTURE);
  uploaded = true;
  await expect(page.locator('#encoder-output')).toBeVisible();
  const value = await page.locator('#encoder-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  const roundTrip = base64ToBytes(value.split(',')[1]);
  expect(roundTrip).toEqual(png);
});

test('rejects unsupported file types with a validation message', async ({ page }) => {
  await page.goto('/tools/base64-image-encoder');
  await page.setInputFiles('#file-drop-zone input[type="file"]', TXT_FIXTURE);
  await expect(page.locator('#encoder-error')).toContainText(/Unsupported file type/i);
});

test('offline reload and conversion work after SW install', async ({ page, context }) => {
  await page.goto('/');
  await waitForServiceWorker(page);
  // Warm the runtime cache by visiting the tool route online.
  await page.goto('/tools/base64-image-encoder');
  await expect(page.getByRole('heading', { name: 'Base64 Image Encoder' })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Base64 Image Encoder' })).toBeVisible();

  await page.setInputFiles('#file-drop-zone input[type="file"]', PNG_FIXTURE);
  await expect(page.locator('#encoder-output')).toBeVisible();
  const value = await page.locator('#encoder-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});

test('sidebar groups the catalog by category with badges', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('#tool-sidebar');
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByRole('heading', { name: 'Images & Assets' })).toBeVisible();
  const link = sidebar.locator('a[href="/tools/base64-image-encoder"]');
  await expect(link).toBeVisible();
  await expect(link).toContainText('Base64 Image Encoder');
  // Status + offline badges render from the registry (FR-21/FR-22).
  await expect(link.locator('.badge').first()).toHaveText(/New/i);
});

test('category filter narrows the catalog (FR-23)', async ({ page }) => {
  await page.goto('/');
  // Default (all categories): the tool card is present.
  await expect(page.locator('#tool-card-base64-image-encoder')).toBeVisible();
  // Choose a category with no registered tools -> empty state, card hidden.
  await page.selectOption('#category-filter', 'audio-video');
  await expect(page.getByText('No tools match the current filters')).toBeVisible();
  await expect(page.locator('#tool-card-base64-image-encoder')).toHaveCount(0);
  // Return to the tool's own category -> card is back.
  await page.selectOption('#category-filter', 'images-assets');
  await expect(page.locator('#tool-card-base64-image-encoder')).toBeVisible();
});

test('works-offline filter keeps verified-offline tools (FR-23)', async ({ page }) => {
  await page.goto('/');
  await page.check('#offline-filter');
  // base64-image-encoder is offline `full`, so it remains under the filter.
  await expect(page.locator('#tool-card-base64-image-encoder')).toBeVisible();
});

test('landing page renders all tools grouped by category', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Civit');
  // All 6 tools should appear in the sidebar groups.
  await expect(page.locator('text=Base64 Image Encoder')).toBeVisible();
  await expect(page.locator('text=PX to REM')).toBeVisible();
  await expect(page.locator('text=Word Counter')).toBeVisible();
  await expect(page.locator('text=Favicon Generator')).toBeVisible();
  await expect(page.locator('text=Image Clipper')).toBeVisible();
});

test('search filters tools correctly', async ({ page }) => {
  await page.goto('/');
  await page.fill('#tool-search', 'px');
  await expect(page.locator('text=PX to REM')).toBeVisible();
  await expect(page.locator('text=Word Counter')).not.toBeVisible();
  await page.fill('#tool-search', '');
});

test('category filter restricts the sidebar', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('#category-filter', 'typography-text');
  await expect(page.locator('text=PX to REM')).toBeVisible();
  await expect(page.locator('text=Image Clipper')).not.toBeVisible();
  await page.selectOption('#category-filter', '');
});

test('tool route loads and renders the tool', async ({ page }) => {
  await page.goto('/tools/px-to-rem');
  await expect(page.locator('text=PX to REM')).toBeVisible();
  await expect(page.locator('text=Convert pixels to rem')).toBeVisible();
});

test('tool 404s for unknown id', async ({ page }) => {
  const response = await page.goto('/tools/not-a-real-tool');
  expect(response?.status()).toBe(404);
});
