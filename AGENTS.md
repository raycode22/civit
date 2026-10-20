# AGENTS.md — Civit

Instructions for AI coding agents and human contributors working on this repository.

## Product purpose

Civit is a privacy-first, local-first browser utility suite: a coherent collection of focused tools for text, developer, colour, image, document, media, and related creative work. The default experience is useful without an account, does not send user content to a server, and is honest about what works offline. Civit may be inspired by the breadth of Delphi.tools but must have its own implementation, interface, tool definitions, and brand.

## Source of truth — read before changing anything

The committed planning pack in `docs/planning/` is the project baseline. **Read the relevant documents before any architectural change:**

- `docs/planning/01-constitution.md` — non-negotiable product/engineering rules; resolve conflicts against it first. Its decision hierarchy: 1) user privacy & security, 2) correctness & preservation of user files, 3) accessibility & error recovery, 4) offline honesty & portability, 5) performance & maintainability, 6) feature breadth & polish.
- `docs/planning/02-prd.md` — MVP scope (curated small-tool set), personas, requirements, acceptance criteria.
- `docs/planning/03-technical-implementation-plan.md` — architecture table, repo layout, registry contract, engine/worker policy, dependency policy, stage gates.
- `docs/planning/04-online-deployment-plan.md` — Cloudflare Pages static deployment, `_headers`, 25 MiB per-asset limit, R2 for large assets.
- `docs/planning/05-offline-pwa-plan.md` — PWA stages, cache policy, offline capability tiers, testing matrix.
- `docs/planning/06-docker-build-plan.md` — multi-stage build, non-root Nginx runtime, core vs offline image variants.
- `docs/planning/07-research-and-stack-validation.md` — verified platform constraints and corrections to the source research.
- `docs/planning/08-qwen-coder-build-guide.md` — phased execution prompts and checkpoints.
- `docs/planning/how_to_use_this.md` — reading order, stage gates, definition of done for a tool.
- `docs/planning/README.md` — planning-pack index.
- `docs/BUILD_STATUS.md` — current roadmap phase status (update when a phase's acceptance criteria actually pass).
- `docs/decisions/` — architecture decision records for costly-to-reverse choices.

These documents are plans, not evidence that code exists or tests passed. Never treat a documented claim as a verified fact at implementation time — re-check current official vendor documentation (versions, limits, compatibility) before relying on it.

## Non-negotiable privacy rules (summary of the constitution)

- Process user-entered text and user-selected files **in the browser**. Never upload, proxy, log, or silently persist user content.
- No accounts, profiles, or server-side database for core tools. No analytics, telemetry SDKs, crash reporting containing user data, third-party trackers, ads, remote fonts, or runtime CDNs in the core app.
- Security-sensitive randomness must come from Web Crypto (`crypto.getRandomValues`, `crypto.randomUUID`). `Math.random()` is unacceptable for passwords/tokens.
- Never render unsanitized user-provided HTML/SVG. Treat all files and imported documents as untrusted input.
- Do not enable COOP/COEP (cross-origin isolation) globally unless a specific approved feature needs it and all cross-origin assets have been tested against the policy.
- Offline support is an engineering property to prove, not a marketing label. Disclose honestly when a tool needs a download, is not offline-ready, or cannot work in the current browser. Never promise permanent cache retention.
- Accessibility is a release requirement: keyboard operability, accessible names, visible focus, semantic status/error messages, and no colour-only status indication.
- Audit dependency licenses and asset provenance before release; do not assume third-party licenses cover Civit's use.

## Baseline stack (do not replace without an approved decision record)

- **Astro** with `output: 'static'` for routes and shell.
- **Svelte 5** via `@astrojs/svelte` for interactive tool islands only; hydrate the active tool, not every widget.
- **TypeScript strict mode.**
- **Tailwind CSS v4** via the official `@tailwindcss/vite` integration (never the old `@astrojs/tailwind` v3 path), plus CSS variables for design tokens.
- **pnpm** with a committed `pnpm-lock.yaml`; Node 22 LTS (Astro's current install docs require ≥ 22.22.0 — verify at bootstrap time).
- **Vitest** unit tests; **Playwright** browser/e2e tests once UI flows exist.
- ESLint + Prettier (or one consciously chosen alternative) pinned at initialization.
- Bits UI selectively for accessible headless primitives; a headless library does not replace accessibility tests.

**Forbidden without an explicitly approved feature and a size/license/browser-support review:** Rust/WASM toolchains, Turborepo/monorepo machinery, FFmpeg, PDF libraries, model runtimes/ONNX, Comlink, server adapters, Pages Functions, databases, authentication, analytics SDKs, file-upload backends. Do not add PWA work before the online stage is stable, or Docker before its stage.

## Static-first deployment decisions

- Online MVP = statically generated site on **Cloudflare Pages**, no Functions/API routes/server runtime. Keep output portable to another static host and to a self-hosted Nginx container.
- Cloudflare Pages limits an individual asset to **25 MiB** (and caps total file count) — verify current limits before deploying. Large engines/models must never be copied into `dist/`; they go to versioned R2 (or equivalent) assets with opt-in downloads.
- Conservative `_headers` baseline only (nosniff, referrer policy, frame deny, geolocation disabled); immutable caching only for verified fingerprinted asset paths; HTML must revalidate. No blanket CSP or COOP/COEP without testing.
- Every declared route must be emitted as real static HTML and verified in the built output; direct links and refresh must work. No SPA fallback rewriting unknown URLs to the home page.

## Staged roadmap (one scoped task at a time)

Foundation → application shell + typed tool registry → lightweight tool vertical slices → test/harden → Cloudflare Pages deployment → online MVP release gate → PWA/offline → optional heavy offline engines (R2) → Docker → later expansion. Start a stage only when the previous stage's exit gate passes (see `docs/planning/how_to_use_this.md` and each plan's gates). Build **complete vertical slices** (UI + engine + validation + tests + registry entry + docs) — never create empty placeholder routes. A planned tool must not appear in production navigation as if it works.

## Commands that should exist once the app is configured (Phase 1+)

```bash
pnpm install --frozen-lockfile   # reproducible install from the committed lockfile
pnpm dev                         # astro dev
pnpm check                       # astro check (with required @astrojs/* check dependencies)
pnpm test                        # vitest run (unit tests)
pnpm build                       # astro check && astro build → static dist/
pnpm preview                     # astro preview (verify built output locally)
pnpm lint                        # eslint .
pnpm format:check                # prettier --check .
pnpm test:e2e                    # playwright test (once e2e suite exists)
```

No application API, server adapter, database, auth, telemetry, or upload backend exists during the online MVP; the build must not require Cloudflare credentials.

## Tests-before-completion policy

- Every meaningful change runs the relevant checks; every PR gate includes: frozen install, lint/format, type/Astro/Svelte checks, unit tests, production static build, registry/route validation, dependency/secret scans, browser tests for changed critical flows.
- A tool is done only per the definition of done in `docs/planning/how_to_use_this.md`: documented I/O limits, validated edge cases, local-only processing, accessible controls, unit + browser tests, verified in a production build, accurate offline labeling.
- **Never claim a test or command passed if you did not execute it.** If the environment cannot run a command, state "not run" and give the exact command that will verify it. Never invent test results, benchmarks, bundle sizes, or deployment status.
- If a task breaks the build, fix that before adding more work. Keep `main` buildable; make the smallest complete change; avoid unrelated refactors; commit one scoped task per checkpoint.
- Never paste API keys, tokens, passwords, or private credentials into prompts or repository files.

## Reporting format for completed tasks

End every task report with: (1) files changed, (2) architectural decisions/dependencies added, (3) commands run with real results (or explicit "not run"), (4) known risks/follow-up work, (5) a manual acceptance checklist. Update `docs/BUILD_STATUS.md` when a phase's acceptance criteria genuinely pass, and add an ADR in `docs/decisions/` for any change listed in the constitution's decision-review triggers (server-side processing, APIs, analytics/auth/sync, remote calls from core tools, persisting content, COOP/COEP, mandatory >25 MiB models, Rust/WASM core or native CLI, hosting changes).
