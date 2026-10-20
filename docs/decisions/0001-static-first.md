# ADR 0001 — Static-first deployment on Cloudflare Pages

**Status:** Accepted (planning baseline; recorded before implementation per Phase 0 of `docs/08-qwen-coder-build-guide.md`)
**Date:** 2026-10-20
**Deciders:** Civit project owner (plan derived from `docs/01-constitution.md` Article IV, `docs/03-technical-implementation-plan.md`, `docs/04-online-deployment-plan.md`, `docs/07-research-and-stack-validation.md`)
**Related:** `AGENTS.md`, `docs/BUILD_STATUS.md`

## Context

Civit's online MVP is a catalogue of independent, client-side utilities. Every published tool processes user text and files in the browser; there is no account system, database, server-side file processing, or general-purpose API in scope (Constitution Articles I, II, IV; PRD non-goals). The product must remain portable to another static host and to a self-hosted container later, and it must be honest about offline capabilities.

Cloudflare Pages currently documents an individual deployed asset maximum of **25 MiB** plus a total per-project file-count cap (Free plan documented at 20,000 files; verify current limits before deploying). Some planned future capabilities (ML models around ~110 MB, FFmpeg cores, other large engines) cannot exist as ordinary site assets.

## Decision

1. **The initial deployment is a statically generated Astro site (`output: 'static'`) hosted on Cloudflare Pages**, with no Pages Functions, no Astro Cloudflare SSR adapter, no API routes, and no required runtime server. The build emits plain HTML/CSS/JS into `dist/` from `pnpm install --frozen-lockfile && pnpm build`.
2. **Every production tool runs client-side.** Any change to that boundary is out of scope for this decision and requires a new ADR (see below).
3. **Large assets stay out of the Pages output.** No engine, model, codec runtime, or other indivisible file larger than the host's per-file limit may ever be copied into `dist/`. Large immutable binaries are distributed separately — the planned route is a versioned, content-hashed object store such as a Cloudflare R2 bucket behind a production custom domain, fetched by explicit user opt-in with size disclosure, integrity verification, retry/quota handling, and removal controls. Workbox precache thresholds are not a workaround for a hosting upload limit.
4. **PWA/offline work is deferred** until the online static release is stable and its acceptance gates pass. Caching must then be designed and tested per route/tool (exact-route precache, deliberate offline fallback page, versioned cache cleanup); registration alone is never treated as offline readiness, and no SPA-style `navigateFallback` to `/404.html` will be adopted blindly.
5. **Docker is deferred** until after the online release and initial PWA work. It packages the *same* static artifact in a multi-stage build ending in a non-root Nginx unprivileged image; it is a second distribution path, not a separate implementation. A distinct `offline` image variant is only built from legally reviewed, checksummed, locally staged assets.
6. **Platform-specific behavior stays isolated** to deployment configuration (`public/_headers`, Pages settings). Core tool code does not import Cloudflare SDKs. Conservative security headers only; **no COOP/COEP cross-origin isolation and no blanket CSP** unless a specific approved feature requires them and every affected origin has been tested.

## Why this option

- Static generation matches the product shape: independent tools behind file-based routes, shell content renderable at build time, no server behavior needed for the MVP.
- It maximizes privacy verifiability: with no application backend, network inspection can prove no user content leaves the device — a constitutional acceptance requirement.
- It keeps cost, operations, and rollback simple: roll back by reverting the `main` commit; preview deployments come free with Pages.
- It preserves portability: the same `dist/` works on any static host and inside the planned Nginx container.
- Alternatives considered and rejected for now: Astro + Cloudflare Workers/SSR adapter (Cloudflare recommends Workers for new projects generally, but Civit needs no runtime; revisit if server capabilities become a real requirement), a full SPA framework (loses build-time HTML, accessibility of no-JS shell content, and route-level bundle isolation), a server-rendered app with an API (violates Constitution Articles I/II/IV without justification), Turborepo/monorepo machinery (no independent packages yet).

## Consequences

**Positive**

- One reproducible static artifact serves Pages, local preview, the future PWA, and the Docker image.
- Deployment requires no secrets; nothing sensitive can leak through front-end environment variables because none should exist.
- Hard 25 MiB/file constraint forces disciplined, versioned, license-reviewed asset distribution from the start.

**Negative / accepted costs**

- No server-side jobs, auth, sync, or runtime-generated responses; adding any of these later is a deliberate architecture change, not an incremental shortcut.
- Offline capability requires real per-tool engineering and testing later; marketing language must lag verified behavior.
- Multi-page static navigation constrains service-worker design (exact-route caching instead of one catch-all fallback).
- Host limits/pricing can change; each release must re-verify current Cloudflare documentation rather than trusting this record.

## Changes that require a new ADR

Any of the following reverses or extends this decision and must be recorded as a new decision record and reviewed against the constitution (decision hierarchy and review triggers):

- Introducing server-side file processing, a backend API, Pages Functions, Workers, or an SSR/server adapter.
- Adding analytics, crash reporting, authentication, accounts, remote synchronization, or any third-party network call made by a core tool.
- Persisting user file content or large drafts beyond explicitly user-controlled low-risk preferences.
- Enabling cross-origin isolation (COOP/COEP) or a strict CSP globally.
- Adopting a mandatory model/engine download larger than 25 MiB, or shipping any large binary inside the Pages output.
- Adopting Rust/WASM as a shared core or adding a native CLI.
- Changing the static hosting strategy, or merging the large-asset channel (e.g., R2) into the application deployment in any way that weakens the opt-in/versioning/integrity requirements above.

## Verification notes

This ADR records a planning decision taken from the committed planning pack; it does not claim that the stack, limits, or versions here have been exercised in code. At implementation time (Phase 1+), verify: current Astro/Svelte/Tailwind compatibility and Node requirements, current Cloudflare Pages per-file and file-count limits, and actual `dist/` paths before writing header/cache rules.
