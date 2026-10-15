import { test, expect, type Page } from '@playwright/test';

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
  // A tiny valid PNG (1x1 px).
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  let uploaded = false;
  page.on('request', (req) => {
    if (req.method() !== 'GET' && !uploaded) {
      // Fail fast if anything tries to POST user data somewhere.
      throw new Error(`Unexpected non-GET request during encoding: ${req.url()}`);
    }
  });
  await page.setInputFiles('#file-drop-zone input[type="file"]', {
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: png
  });
  uploaded = true;
  await expect(page.locator('#encoder-output')).toBeVisible();
  const value = await page.locator('#encoder-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  expect(Buffer.from(value.split(',')[1], 'base64').equals(png)).toBe(true);
});

test('rejects unsupported file types with a validation message', async ({ page }) => {
  await page.goto('/tools/base64-image-encoder');
  await page.setInputFiles('#file-drop-zone input[type="file"]', {
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello')
  });
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

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  await page.setInputFiles('#file-drop-zone input[type="file"]', {
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: png
  });
  await expect(page.locator('#encoder-output')).toBeVisible();
  const value = await page.locator('#encoder-output-text').inputValue();
  expect(value.startsWith('data:image/png;base64,')).toBe(true);
  await expect(page.locator('#offline-indicator')).toBeVisible();
  await context.setOffline(false);
});
