# ADR-001: PWA integration approach

**Status:** Accepted
**Date:** 2026-10-17
**Stage:** Technical Implementation Plan, Stage 10 (first checklist item)
**Related:** Constitution §3 and §16; PRD FR-13, FR-14, FR-28, FR-31

## Context

Constitution §3 requires a recorded, verified decision on the PWA
integration approach before any PWA integration is added or replaced. The
decision is between:

1. **SvelteKit's native service-worker support** (a `src/service-worker`
   module plus the `$service-worker` module).
2. **A Vite+-compatible PWA plugin** (exact package name intentionally not
   assumed here; it must be verified against the installed Vite+ release).

No plugin name may be assumed (Constitution §3).

## Verified facts (checked in this repository on 2026-10-17)

- The scaffold already ships a hand-written service worker at
  `static/sw.js` (versioned caches, app-shell precache, network-first
  navigations, cache-first hashed assets, stale-while-revalidate fallback).
- `src/app.html` registers it explicitly via
  `navigator.serviceWorker.register('%sveltekit.assets%/sw.js')`.
- The installed `@sveltejs/kit` package **declares the `$service-worker`
  module** (seen in its type definitions), so SvelteKit's native
  service-worker support is present in the installed version.
- `static/manifest.webmanifest` and installability metadata already exist
  and are served with correct MIME handling by both the static headers
  file and the container's nginx config.
- The existing Playwright suite already exercises a network-disabled
  reload + tool execution (`tests/e2e/smoke.spec.ts`), which currently
  passes against the hand-written worker.
- No PWA plugin is present in `package.json`; nothing in the Vite+
  config references one.

## Decision

**Keep the hand-written `static/sw.js` for this increment.** It is already
registered, already covered by an offline E2E test, and its caching
strategy (immutable hashed assets + shell precache + versioned runtime
cache) matches the strategy the PRD requires. Adopting a plugin now would
replace a *verified* mechanism with an unverified one for no functional
gain, and would violate the "do not assume a plugin name" rule unless a
specific package is first verified against the installed Vite+ release.

**Recorded follow-up triggers** (revisit before Phase B/C heavy-asset
work): if/when we need build-integrated precache manifest generation for
self-hosted WASM/model assets (Constitution §16), re-evaluate migrating to
SvelteKit's native `src/service-worker` (which can read
`$service-worker.files`/`version`) or to a verified Vite+-compatible
plugin. Any such migration must keep the existing offline E2E test
green and must not introduce a runtime third-party origin.

## Consequences

- `static/sw.js` remains the service worker of record; changes to it are
  governed by Constitution §3 (versioning, update behavior, interrupted
  install recovery).
- The offline indicator and per-tool offline badges continue to be driven
  by the registry, not by the service worker implementation.
- Stage 10's remaining checklist items (per-tool "make available offline",
  quota handling, cache versioning verification) proceed against this
  worker.
- This ADR must be re-opened if the offline E2E test regresses or if the
  heavy-asset caching requirement outgrows the hand-written manifest.