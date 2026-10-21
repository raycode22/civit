# Civit

**Civit is a planned local-first, privacy-focused, browser-based digital toolkit** inspired by Delphi.tools. It is intended to bring useful utilities for developers, designers, and digital creators into one application.

Utilities are intended to perform processing locally in the user's browser wherever practical, particularly when handling user-provided files or sensitive content. The application aims to minimize unnecessary data transmission and avoid requiring an application backend for tools that can run entirely on the client.

> **Status: Phases 2–3 in progress — six tools implemented.** A buildable Astro site exists with a shared layout, daisyUI/Catppuccin light/dark theme system, a typed tool registry containing six implemented tools, and working utilities at `/tools/json-formatter/` (format/minify/clear/copy), `/tools/uuid-generator/` (batch UUID v4 via Web Crypto), `/tools/password-generator/` (configurable character sets, unbiased sampling), `/tools/word-counter/` (live word/character/line/sentence/paragraph stats, top words, reading time), `/tools/base64-tool/` (UTF-8-safe Base64 encode/decode with actionable errors), and `/tools/url-encoder/` (component and whole-URL percent encoding/decoding) — all processed entirely in your browser. Civit is *not* yet functional as a complete product: the remaining planned tools, offline support, and deployment do not exist. Civit is not installable, offline-capable, production-ready, or feature-equivalent to Delphi.tools. See [Development status](#8-development-status-and-contribution-expectations) and [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md).

Intended users: developers, designers, and digital creators who want small, focused utilities (text, developer, colour, image, document, media work) without creating accounts or uploading their content to someone else's server. The problem it addresses: everyday utilities are either scattered across ad-laden single-purpose sites or require installing heavyweight software; Civit aims to be one trustworthy app where your files stay on your machine.

## 1. Project goals

- **A unified collection of digital utilities** — a curated set of focused tools behind one coherent interface, not a clone of any existing product's catalogue.
- **Browser-side processing where practical** — user-entered text and user-selected files are processed in the browser; no upload, proxying, logging, or silent persistence of user content.
- **Modular, maintainable, independently testable tools** — each tool is a vertical slice: typed registry entry, UI island, pure engine, validation, tests, and docs.
- **Responsive and accessible user interfaces** — accessibility (keyboard operability, visible focus, semantic status messages, WCAG AA contrast) is a release requirement, not polish.
- **Progressive offline support and self-hosting** — honest per-tool offline labels proven by real testing, then PWA installation/caching, then Docker-based self-hosting.

## 2. Technology stack (planned baseline)

The stack below is the accepted plan from [`AGENTS.md`](AGENTS.md), [`docs/planning/03-technical-implementation-plan.md`](docs/planning/03-technical-implementation-plan.md), and [`docs/decisions/0001-static-first.md`](docs/decisions/0001-static-first.md). As of Phase 1 / Prompt 1A it is **configured in the repository** with these verified versions (`astro --version` = 7.4.1; exact resolutions recorded in `pnpm-lock.yaml`; TypeScript pinned to the 5.9 line because Astro/Svelte tooling does not yet target the newly released TypeScript 7):

| Layer | Choice (installed) |
|---|---|
| Framework | Astro `^7.4.1`, explicit `output: 'static'` |
| Interactive UI | Svelte `^5.57.2` islands via `@astrojs/svelte ^9.1.0`, hydrating the active island only |
| Language | TypeScript strict (`astro/tsconfigs/strict`), `typescript ~5.9.0`, checked by `@astrojs/check ^0.9.11` |
| Styling | Tailwind CSS `^4.3.3` (`@tailwindcss/vite ^4.3.3`) + **daisyUI `^5.7.50`** (CSS `@plugin` syntax) with custom **Catppuccin Latte/Mocha** themes — see the [Civit Catppuccin style guide](docs/design/catppuccin-style-guide.md) |
| Package manager | pnpm `10.34.7` (`packageManager` field; committed `pnpm-lock.yaml`) |
| Development runtime | Node.js `22.22.0` (`.nvmrc`; Astro's engines require ≥ 22.22.0) |
| Unit tests | Vitest `^3.2.7` (v5 kept out until Astro/Svelte compatibility is verified) |
| Initial online deployment | Cloudflare Pages (static hosting, no Functions/server runtime) — **not configured yet (Phase 5)** |
| Later stages | PWA infrastructure (`@vite-pwa/astro`, manifest, service worker) and Docker — **not installed, by design** |

Playwright browser/e2e tests arrive once UI flows exist (Phases 2–4); ESLint/Prettier are pinned when the shell lands. None of these later-phase tools are installed at Prompt 1A.

## 3. Architecture and privacy

- **Static-first deployment.** The MVP ships as statically generated HTML/CSS/JS; the same artifact targets Cloudflare Pages, local preview, and the later Docker/Nginx image ([ADR 0001](docs/decisions/0001-static-first.md)).
- **No required application backend for the initial MVP.** No accounts, database, analytics, telemetry SDKs, trackers, remote fonts, or runtime CDNs in the core app.
- **Client-side processing where suitable.** Security-sensitive randomness uses Web Crypto; untrusted input (files, SVG/HTML) is never rendered unsanitized.
- **Heavy compute and media tasks** may require Web Workers, WebAssembly, or optional downloaded assets — always with explicit user opt-in, size disclosure, and integrity verification.
- **Large models must not be assumed to fit in Cloudflare Pages assets** (documented per-asset limit ~25 MiB; re-verify before deploying). Engines/models go to versioned external storage (e.g., R2) with opt-in downloads — never copied into `dist/`.
- **Any future telemetry, external processing, or backend dependency requires explicit architectural review** and a new architecture decision record (see the constitution's review triggers and ADR 0001's change list).

## 4. Development roadmap

Civit is being developed in deliberate stages: first a working online application, then installable PWA and offline capabilities, and finally Docker-based self-hosting and optional offline distribution. One stage starts only when the previous stage's acceptance gate passes.

| Phase | Outcome | Planning reference |
|---|---|---|
| 0 | Repository setup, planning pack, agent instructions, README (this stage) | [`docs/planning/08-qwen-coder-build-guide.md`](docs/planning/08-qwen-coder-build-guide.md) |
| 1 | Minimum viable Astro/Svelte application (foundation scaffold, checks green) | [`docs/planning/03-technical-implementation-plan.md`](docs/planning/03-technical-implementation-plan.md) |
| 2–3 | Application shell, typed tool registry, lightweight tool vertical slices, tests | [`docs/planning/02-prd.md`](docs/planning/02-prd.md), [`docs/planning/how_to_use_this.md`](docs/planning/how_to_use_this.md) |
| 4–6 | Test & harden, Cloudflare Pages deployment, online MVP release gate | [`docs/planning/04-online-deployment-plan.md`](docs/planning/04-online-deployment-plan.md) |
| 7 | PWA installation, caching, verified offline support | [`docs/planning/05-offline-pwa-plan.md`](docs/planning/05-offline-pwa-plan.md) |
| 8 | Optional WASM engines / ML models via opt-in downloads | [`docs/planning/04-online-deployment-plan.md`](docs/planning/04-online-deployment-plan.md), [`docs/planning/05-offline-pwa-plan.md`](docs/planning/05-offline-pwa-plan.md) |
| 9 | Docker self-hosting and offline image variants | [`docs/planning/06-docker-build-plan.md`](docs/planning/06-docker-build-plan.md) |
| 10 | Later tool expansion (PRD waves) | [`docs/planning/02-prd.md`](docs/planning/02-prd.md) |

Product and engineering rules live in [`docs/planning/01-constitution.md`](docs/planning/01-constitution.md); platform claims are validated in [`docs/planning/07-research-and-stack-validation.md`](docs/planning/07-research-and-stack-validation.md).

## 5. Repository structure

Actual contents at the time of writing (Prompts 2A/2B committed; Prompts 3A JSON Formatter and 3B UUID + Password Generators landed locally — three real tools exist under `/tools/<slug>/`):

```
.
├── AGENTS.md                  # Instructions for AI agents and contributors (repo root)
├── README.md                  # This file
├── .gitignore                 # Ignores node_modules, dist/, .astro/, logs
├── .nvmrc                     # Pinned Node.js runtime (22.22.0)
├── package.json               # Scripts: dev, check, test, build, preview
├── pnpm-lock.yaml             # Committed lockfile (reproducible installs)
├── pnpm-workspace.yaml        # onlyBuiltDependencies: [esbuild]
├── astro.config.ts            # output: 'static', Svelte integration, Tailwind v4 Vite plugin
├── svelte.config.js           # vitePreprocess for TS-in-Svelte tooling
├── tsconfig.json              # extends astro/tsconfigs/strict
├── vitest.config.ts           # unit tests (node environment, tests/**)
├── src/
│   ├── layouts/BaseLayout.astro       # Shared shell: landmarks, skip link, nav, footer, theme wiring
│   ├── pages/index.astro              # Civit landing page (work-in-progress messaging)
│   ├── pages/tools/index.astro        # /tools/ index rendered from the typed registry (lists implemented tools)
│   ├── pages/tools/[slug].astro       # Registry-driven dynamic tool routes (emits all implemented tool pages)
│   ├── components/ToolkitStatus.svelte  # Svelte 5 runes island (integration check only)
│   ├── components/tools/JsonFormatter.svelte # JSON Formatter UI island (Prompt 3A)
│   ├── components/tools/UuidGenerator.svelte  # UUID Generator UI island (Prompt 3B)
│   ├── components/tools/PasswordGenerator.svelte # Password Generator UI island (Prompt 3B)
│   ├── components/ThemeToggle.svelte    # Svelte 5 light/dark toggle island
│   ├── lib/text/wordCount.ts          # tiny pure engine used by the island
│   ├── lib/tools/json.ts                # JSON Formatter engine (native parse/stringify, guardrails)
│   ├── lib/tools/uuid.ts                # UUID v4 engine (crypto.randomUUID/getRandomValues, batch bounds)
│   ├── lib/tools/password.ts            # Password engine (rejection sampling, charset validation)
│   ├── lib/theme/theme.ts             # pure theme resolution/persistence + pre-paint script source
│   ├── lib/tools/                     # Typed tool registry (Prompt 2B)
│   │   ├── types.ts                   # ToolMetadata contract per technical plan §4
│   │   ├── registry.ts                # Single metadata source; six implemented entries (JSON/UUID/Password/WordCount/Base64/URL)
│   │   ├── validate.ts                # Build/test-time registry invariants
│   │   └── routes.ts                  # Stable /tools/<slug>/ path helpers
│   ├── lib/search/toolSearch.ts       # Pure search over registry metadata
│   └── styles/
│       ├── global.css                 # Tailwind v4 import + daisyUI @plugin
│       └── theme.css                  # catppuccin-latte / catppuccin-mocha daisyUI themes + Civit tokens
├── tests/
│   ├── wordCount.test.ts      # Vitest unit tests
│   ├── theme.test.ts          # theme resolution/persistence unit tests
│   ├── toolRegistry.test.ts   # registry validation + search matching unit tests
│   ├── toolSearch.test.ts     # catalogue-integrity + search UI logic tests (Prompt 2A)
│   ├── jsonFormatter.test.ts  # JSON Formatter engine unit tests
│   └── generators.test.ts     # UUID + Password generator engine unit tests
└── docs/
    ├── BUILD_STATUS.md        # Honest, evidence-backed phase status tracker
    ├── design/
    │   └── catppuccin-style-guide.md  # Permanent visual-system guide (palette, roles, contrast rules)
    ├── decisions/
    │   └── 0001-static-first.md  # ADR: static Astro site on Cloudflare Pages
    └── planning/              # Canonical home of the planning pack
        ├── README.md          # Planning-pack index
        ├── how_to_use_this.md # Reading order, stage gates, definition of done
        └── 01…08-*.md         # Constitution, PRD, technical/deployment/PWA/Docker plans, build guide
```

- **Root** holds project-level documentation (`README.md`, `AGENTS.md`) and the application scaffold configuration.
- **`src/`** follows `docs/planning/03-technical-implementation-plan.md`: the shared layout, theme system, typed tool registry, and search logic exist, plus the first vertical slices: JSON Formatter (3A), UUID Generator + Password Generator (3B), and Word Counter + Base64 Encoder/Decoder + URL Encoder/Decoder (3C). The registry contains exactly six implemented tools; all other planned tools are intentionally absent and must not be assumed to work.
- **`tests/`** holds Vitest unit tests for the word-count, theme, registry/search, and JSON-formatter engines; browser/e2e suites arrive with later phases.
- **`docs/planning/`** is the canonical location for the planning pack — product principles, PRD, technical plan, deployment/PWA/Docker plans, stack validation, and the phased build guide. These are *plans*, not evidence that code exists.
- **`docs/decisions/`** holds architecture decision records (ADRs) for costly-to-reverse choices.
- **`docs/BUILD_STATUS.md`** is the single checklist of what has actually been verified, phase by phase.

## 6. Getting started

**Prerequisites:** Node.js 22.22.0+ (see `.nvmrc`) and pnpm 10 (the `packageManager` field pins `pnpm@10.34.7`; enable it with Corepack or install it directly).

Verified commands (re-run successfully on Node 22.22.0 / pnpm 10.34.7 during Prompt 1B; see the BUILD_STATUS verification log for exact results):

```bash
pnpm install --frozen-lockfile   # reproducible install from the committed lockfile
pnpm dev                         # local development server (Astro)
pnpm check                       # astro check — TypeScript/Astro/Svelte diagnostics
pnpm test                        # vitest run — unit tests
pnpm build                       # astro check && astro build → static dist/
pnpm preview                     # serve the built dist/ locally to verify output
```

What exists today is the foundation, the shared shell, the typed tool registry plumbing, and six usable tools: static pages for home, `/tools/`, `/tools/json-formatter/`, `/tools/uuid-generator/`, `/tools/password-generator/`, `/tools/word-counter/`, `/tools/base64-tool/`, `/tools/url-encoder/`, plus a 404 page, a theme system, interactive islands, and registry/search/validation/engine modules with unit tests. Everything else on the planned tool list is still unimplemented. See [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md) and the roadmap above. For the staged workflow, read [`docs/planning/how_to_use_this.md`](docs/planning/how_to_use_this.md) and execute [`docs/planning/08-qwen-coder-build-guide.md`](docs/planning/08-qwen-coder-build-guide.md) one scoped prompt at a time (next: Prompt 3D).

## 7. License

**No license has been selected for Civit yet.** The repository contains no `LICENSE` file and no recorded license decision; [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md) tracks this as an open gap (Constitution Article X), and a license plus asset-provenance audit are required before any public release. Civit is inspired by Delphi.tools but does not use its license or claim any equivalence; nothing here grants reproduction rights to third-party products' content.

## 8. Development status and contribution expectations

Per [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md): **Phase 0 (planning pack, agent instructions, ADR, status tracker, repository organization, and this README) is complete.** In Phase 1, **Prompts 1A and 1B (scaffold; shared shell with daisyUI 5 + Catppuccin Latte/Mocha design system) are committed**. In Phase 2, **Prompt 2A (home search/categories UI, ToolLayout, static 404 page, responsive-nav polish, style-guide cleanup) is committed** (`283c957`) and **Prompt 2B (typed tool registry, search/validation logic, registry-driven `/tools/` routes) is committed** (`20e888a`). In Phase 3, **Prompt 3A (JSON Formatter vertical slice) is committed** (`20e888a`), **Prompt 3B (UUID Generator + Password Generator vertical slices) is committed** (`3210fb7`), and **Prompt 3C (Word Counter + Base64 Encoder/Decoder + URL Encoder/Decoder vertical slices) is implemented and locally verified** — engines covered by 31 new unit tests (word stats, UTF-8-safe Base64 round-trips and error classification, percent-encoding semantics/malformed-sequence tolerance) on top of the existing suites; `pnpm check` (0 errors/warnings/hints, 33 files), `pnpm test` (123 tests across 9 files), and `pnpm build` (static, 9 pages incl. `dist/tools/word-counter/index.html`, `dist/tools/base64-tool/index.html`, and `dist/tools/url-encoder/index.html`) all passed on Node 22.22.0 / pnpm 10.34.7; local preview served `/`, `/tools/`, and all six tool routes with HTTP 200 — and awaits review/checkpoint. Prompts 3D–10 have **not started**: beyond the six implemented tools there are no other tools, no deployment, PWA, or Docker artifact. Browser-dependent behavior (theme-toggle clicks, reload persistence, flash-of-wrong-theme, formatter/generator typing, clicks, clipboard, downloads, word-counter live updates, base64/url conversions) has **not** been tested in a real browser.

Expectations for contributors and AI coding agents (full detail in [`AGENTS.md`](AGENTS.md)):

- Read the relevant documents in `docs/planning/` before any architectural change; resolve conflicts against the constitution first.
- A feature may be described as complete only after passing its applicable verification: type/lint/format checks, unit tests, browser tests, production-build verification, and the tool definition of done in [`docs/planning/how_to_use_this.md`](docs/planning/how_to_use_this.md). Never claim a test or command passed if it was not executed.
- Privacy rules are non-negotiable: local-only processing of user content, no accounts/analytics/trackers, Web Crypto for security-sensitive randomness, no unsanitized rendering of user input.
- Accessibility is a release requirement; every UI change must pass keyboard/screen-reader/contrast checks recorded in `docs/BUILD_STATUS.md`.
- Documentation updates (status file, ADRs, this README) are part of the work, not an afterthought.
