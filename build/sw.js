/* Civit service worker — offline-first caching.
 *
 * Strategy:
 *  - PRECACHE (cache-first, immutable): app shell assets precached at install.
 *  - Hashed build assets (_app/immutable/**): cache-first forever; they are
 *    content-hashed so they never go stale.
 *  - HTML navigations: network-first with fallback to cached '/' shell and
 *    finally to an offline response, so deep links work offline behind the
 *    SPA fallback.
 *  - Everything else same-origin: stale-while-revalidate.
 *  - Versioned cache names; activate purges old caches. Failed install
 *    leaves the previous version intact (skipWaiting is NOT used until
 *    message from a new worker; we use clientsClaim+skipWaiting after a
 *    fully successful install).
 */

const VERSION = 'v2';
const PRECACHE = `civit-precache-${VERSION}`;
const RUNTIME = `civit-runtime-${VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/theme-init.js',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

/** Best-effort cache write; failures must never break the fetch pipeline. */
function putInCache(cacheName, request, response) {
  caches
    .open(cacheName)
    .then((cache) => cache.put(request, response))
    .catch(() => {
      /* storage full / opaque response — non-fatal */
    });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting)
      .catch((err) => {
        // Interrupted/partial installation: do not claim clients; keep the
        // existing service worker serving traffic. Retry happens on next
        // page load when the browser re-checks for updates.
        console.error('Precache failed; keeping previous worker active:', err);
        throw err;
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))
        )
      )
      .then(self.clients.claim)
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // never touch third-party requests

  // Navigations: network-first, fall back to cached shell (offline deep links).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the SPA fallback shell under BOTH '/index.html' and this
          // exact navigation URL. The static host serves every unknown route
          // from index.html, so caching per-URL lets an offline reload of a
          // deep link (e.g. /tools/<id>) succeed via `caches.match(request)`
          // even when the worker controlling the reload is freshly installed.
          putInCache(RUNTIME, '/index.html', response.clone());
          putInCache(RUNTIME, request, response.clone());
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          return (
            cached ||
            new Response('Offline — could not load this page from cache.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            })
          );
        })
    );
    return;
  }

  // Content-hashed immutable assets: cache-first.
  if (url.pathname.startsWith('/_app/immutable/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            putInCache(RUNTIME, request, response.clone());
            return response;
          })
      )
    );
    return;
  }

  // Same-origin everything else: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            putInCache(RUNTIME, request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
