# Civit Offline and PWA Plan

**Implementation stage:** after the online MVP is stable  
**Primary libraries:** `@vite-pwa/astro` and Workbox, subject to compatibility check  
**Storage:** Cache Storage for fetchable resources; IndexedDB only for structured metadata or explicit user state

## 1. Objective and scope

Make the installed Civit experience useful when a user has no connection, without claiming every possible tool is automatically available offline. Start by making the app shell and core static routes reliable. Add large processing engines/models as separately downloadable offline capabilities.

A PWA manifest makes the application installable in supporting browsers; a service worker provides caching/offline behavior. These are related but separate requirements. Caching must be designed and tested; registration alone is not sufficient.

## 2. Offline capability tiers

Every tool declares one of these states in its registry and user interface:

- **Core offline:** all required UI/logic/static data is included in the core cache; no remote service or optional engine is needed.
- **Download to enable offline:** the tool needs a large engine/model or data package, but the user can download it before going offline.
- **Online-only:** a required capability has no supported local path. Do not mislabel it as offline-capable.
- **Unavailable in this browser:** the device lacks a required API/codec or memory capability; the UI should explain the reason where possible.

The app can be installed while some tools remain “download to enable offline.” Installation does not imply that a model is cached, has enough memory to run, or will remain stored permanently.

## 3. Stage PWA-1: manifest and minimum service worker

1. Verify the deployed static app works completely without PWA code.
2. Add a web app manifest with Civit’s name, short name, display mode, start URL, scope, theme/background colors, and correctly sized icons.
3. Add `@vite-pwa/astro` only after checking its current release notes and compatibility with the actual Astro/Vite major versions selected in the repository.
4. Generate a service worker using Workbox defaults where possible; use custom service-worker code only when the tested route/cache policy requires it.
5. Precache only a controlled set of app shell, route HTML, CSS, JavaScript chunks, icons, fonts if locally bundled, and the offline fallback page.
6. Implement an offline route/page that explains what is cached and how to reconnect or download missing engines.
7. Add a visible installation affordance only where the browser exposes an install prompt; keep ordinary browser instructions available on platforms without that API.
8. Implement versioned cache names and safe cleanup of old application caches on activate.

Do not copy the sample strategy of raising Workbox’s precache maximum to 50 MiB and adding `onnx` files indiscriminately. That would make large assets candidates for precaching without respecting Cloudflare Pages’ 25 MiB per-file cap or mobile storage/runtime constraints.

## 4. Cache policy

### Precache

Good candidates:

- the static routes the app advertises as core offline;
- the small chunks required by the core utilities;
- icons, global CSS, and an offline fallback;
- small static lookup data that has a versioned, reviewed lifecycle.

Do not precache every future engine or model automatically. Avoid bundling large optional libraries into the home route.

### Runtime cache

Use runtime caches for selected immutable assets and explicit downloads. Every cache should have:

- a named/versioned policy;
- a limit or explicit list of managed keys;
- an update/deletion strategy;
- error handling for quota failures;
- observable cache state for the user where it affects offline readiness.

Cache Storage does not automatically honor HTTP cache-control headers or expire entries for the application. Civit owns cache cleanup and version compatibility.

### Model/engine downloads

- Require a clear user action (for example, “Download engine for offline use”).
- Show compressed download size, model/engine version, licence, whether a network connection is needed, and approximate local storage impact before starting.
- Fetch only from the expected HTTPS origin and validate the expected size/checksum or a signed release manifest before marking the asset ready.
- Make downloads retryable and handle interrupted/partial transfers safely. Never interpret a partially cached model as ready.
- Use immutable asset URLs per version; a new model uses a new key.
- Store/download one asset at a time when parallel downloads would create memory pressure.
- Provide “Remove downloaded engine” and “Clear offline data” controls.
- Use `navigator.storage.estimate()` where available as an estimate, catch `QuotaExceededError`, and keep functionality correct when estimate/persistence APIs are absent.
- Treat persistence requests (`navigator.storage.persist()`) as best-effort only. Browser support and user agent policy vary.

## 5. Cross-origin assets and Cloudflare R2

Large models cannot be uploaded as ordinary Pages assets when an individual file exceeds 25 MiB. Store them in R2 or another explicit asset host, preferably behind a controlled production custom domain.

The app must be able to fetch the asset in CORS mode, verify it, cache it for future fetches, and use it offline. Configure R2 CORS to allow the production origin and the relevant preview origin. Verify status codes, content type, `Content-Length` behavior where available, CORS exposure requirements, and cache keys against the exact browser request.

If future code uses COEP `require-corp` for multi-threaded WASM, every cross-origin resource involved must satisfy the applicable CORP/CORS requirements. A policy change should be tested against fonts, images, R2 binaries, downloads, any embeds, and developer preview origins.

## 6. Navigation and multi-page Astro behavior

Civit is a statically generated multi-page site, not automatically a client-side SPA. Do not use a catch-all SPA fallback that routes every unknown/offline path to an arbitrary page or treats `/404.html` as the universal success response.

The preferred behavior is:

1. Precache the HTML for the selected core offline routes.
2. Serve a cached route when that exact route is available.
3. For a navigation request that cannot be served offline, show a deliberate offline fallback page with accurate messaging.
4. Preserve normal online 404 handling for unknown paths.
5. Test route normalization/trailing slash rules on Pages and the service worker in the production build.

A custom Workbox navigation route may be required to achieve that behavior. Validate the selected `@vite-pwa/astro` configuration against the built service worker rather than assuming an example configuration behaves as desired in Astro’s multi-page output.

## 7. Offline readiness UI and state model

Tool readiness needs to be derived from actual prerequisites, not only `navigator.onLine`.

Proposed state dimensions:

- app shell: `cached | missing | unknown`;
- tool JavaScript: `cached | missing | unknown`;
- engine/model: `not-required | not-downloaded | downloading | verifying | ready | failed | removed`;
- network: `online | offline | unknown`;
- browser capability: `supported | unsupported | unknown`.

Display a concise actionable message. Example: “This tool works offline after its image engine is downloaded. The engine is not currently on this device.” A device may report online but still fail to reach the asset host; readiness must therefore use cache and capability information as well.

## 8. Service worker update behavior

- Use a clear update notice and do not force-refresh while a tool is processing a large file.
- Defer application refresh until the user finishes/cancels a task, or provide a visible “Reload to update” action.
- Keep old caches until the new app can safely take over, then clean them up.
- Avoid mixing a new tool UI with an old cached WASM/model ABI. Tie engine manifest versions to app compatibility ranges.
- On update errors, keep the current working cached version and explain what happened.

## 9. Testing matrix

For each supported browser/platform, test:

1. Fresh install while online.
2. First use of core utility.
3. Close and reopen app.
4. Disable network and use a cached core tool.
5. Navigate directly to a cached tool URL while offline.
6. Visit an uncached route while offline and see the fallback.
7. Start a large download, interrupt it, retry it, then verify integrity.
8. Use a cached model with network disabled.
9. Simulate insufficient storage/QuotaExceededError.
10. Remove the model and confirm the UI no longer claims offline readiness.
11. Deploy a new app version and verify update messaging/cache cleanup.
12. Clear site data and confirm graceful recovery.
13. Verify that no user file/content is included in Cache Storage or IndexedDB unless an explicit feature has documented that behavior.

Use Playwright for repeatable supported scenarios, plus manual checks on iOS Safari and target mobile browsers because installation and storage policies differ by platform.

## 10. Offline release gate

Do not call the PWA “offline-ready” until:

- core routes are verified with networking disabled;
- every tool displays an accurate readiness state;
- cache cleanup and update behavior work;
- download progress, cancellation, integrity validation, quota failure, and eviction recovery are tested for heavy engines;
- the R2/CORS path is proven in production;
- the app discloses that storage may be cleared by the browser or user.

## 11. References

- MDN, offline/background operation: <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation>
- MDN, installability: <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>
- MDN, Cache API: <https://developer.mozilla.org/en-US/docs/Web/API/Cache>
- MDN, storage quotas/eviction: <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>
- MDN, StorageManager: <https://developer.mozilla.org/en-US/docs/Web/API/StorageManager>
- Vite PWA Astro integration: <https://github.com/vite-pwa/astro>
