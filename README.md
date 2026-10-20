# Civit

**Civit is a planned local-first, privacy-focused, browser-based digital toolkit** inspired by Delphi.tools. It is intended to bring useful utilities for developers, designers, and digital creators into one application.

Utilities are intended to perform processing locally in the user's browser wherever practical, particularly when handling user-provided files or sensitive content. The application aims to minimize unnecessary data transmission and avoid requiring an application backend for tools that can run entirely on the client.

> **Status: planning / documentation only.** No application code exists yet. Civit is *not* currently functional, installable, offline-capable, production-ready, or feature-equivalent to Delphi.tools. See [Development status](#8-development-status-and-contribution-expectations) and [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md).

Intended users: developers, designers, and digital creators who want small, focused utilities (text, developer, colour, image, document, media work) without creating accounts or uploading their content to someone else's server. The problem it addresses: everyday utilities are either scattered across ad-laden single-purpose sites or require installing heavyweight software; Civit aims to be one trustworthy app where your files stay on your machine.

## 1. Project goals

- **A unified collection of digital utilities** — a curated set of focused tools behind one coherent interface, not a clone of any existing product's catalogue.
- **Browser-side processing where practical** — user-entered text and user-selected files are processed in the browser; no upload, proxying, logging, or silent persistence of user content.
- **Modular, maintainable, independently testable tools** — each tool is a vertical slice: typed registry entry, UI island, pure engine, validation, tests, and docs.
- **Responsive and accessible user interfaces** — accessibility (keyboard operability, visible focus, semantic status messages, WCAG AA contrast) is a release requirement, not polish.
- **Progressive offline support and self-hosting** — honest per-tool offline labels proven by real testing, then PWA installation/caching, then Docker-based self-hosting.

## 2. Technology stack (planned baseline)

The stack below is the *accepted plan* from [`AGENTS.md`](AGENTS.md), [`docs/planning/03-technical-implementation-plan.md`](docs/planning/03-technical-implementation-plan.md), and [`docs/decisions/0001-static-first.md`](docs/decisions/0001-static-first.md). None of it is configured in this repository yet — there is no `package.json`, lockfile, or framework code at the time of writing. If future repository configuration ever contradicts this list, that discrepancy must be reported and resolved via a decision record, not silently.

| Layer | Planned choice |
|---|---|
| Framework | Astro with static-first output (`output: 'static'`) |
| Interactive UI | Svelte 5 islands (via `@astrojs/svelte`), hydrating the active tool only |
| Language | TypeScript with strict type checking |
| Styling | Tailwind CSS v4 (official `@tailwindcss/vite` integration) + CSS design tokens |
| Package manager | pnpm (committed `pnpm-lock.yaml`) |
| Development runtime | Node.js 22 LTS baseline |
| Initial online deployment | Cloudflare Pages (static hosting, no Functions/server runtime) |
| Later stages | PWA infrastructure (`@vite-pwa/astro`, manifest, service worker) and Docker — introduced only in their own phases |

Testing is planned around Vitest (unit) and Playwright (browser/e2e) once code exists.

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

Actual contents at the time of writing (documentation only — no `src/`, `package.json`, or config files exist yet):

```
.
├── AGENTS.md                  # Instructions for AI agents and contributors (repo root)
├── README.md                  # This file
├── .gitignore                 # Basic ignores (node_modules, build artifacts)
└── docs/
    ├── BUILD_STATUS.md        # Honest, evidence-backed phase status tracker
    ├── decisions/
    │   └── 0001-static-first.md  # ADR: static Astro site on Cloudflare Pages
    └── planning/              # Canonical home of the planning pack
        ├── README.md          # Planning-pack index
        ├── how_to_use_this.md # Reading order, stage gates, definition of done
        ├── 01-constitution.md
        ├── 02-prd.md
        ├── 03-technical-implementation-plan.md
        ├── 04-online-deployment-plan.md
        ├── 05-offline-pwa-plan.md
        ├── 06-docker-build-plan.md
        ├── 07-research-and-stack-validation.md
        └── 08-qwen-coder-build-guide.md
```

- **Root** holds project-level documentation: `README.md` (what/why) and `AGENTS.md` (how agents/contributors must work here).
- **`docs/planning/`** is the canonical location for the planning pack — product principles, PRD, technical plan, deployment/PWA/Docker plans, stack validation, and the phased build guide. These are *plans*, not evidence that code exists. (The planned future `src/` layout in `docs/planning/03-technical-implementation-plan.md` describes where application code *will* live; none of it exists yet.)
- **`docs/decisions/`** holds architecture decision records (ADRs) for costly-to-reverse choices.
- **`docs/BUILD_STATUS.md`** is the single checklist of what has actually been verified, phase by phase.

## 6. Getting started

**Current state:** the repository contains only planning and operational documentation. There is no `package.json`, so **there are no working install, dev, test, or build commands yet** — inventing them would be dishonest, and they are forbidden until Phase 1 creates and verifies them.

What you can do today:

1. Read [`docs/planning/README.md`](docs/planning/README.md) for the pack index and reading order.
2. Follow [`docs/planning/how_to_use_this.md`](docs/planning/how_to_use_this.md) for stage gates and the definition of done.
3. Execute the roadmap with [`docs/planning/08-qwen-coder-build-guide.md`](docs/planning/08-qwen-coder-build-guide.md) — one scoped prompt per task, starting with Prompt 1A (Phase 1 foundation) only after Phase 0 is reviewed and committed.

When the application scaffold exists (Phase 1+), this section will be updated with the verified commands from `package.json` (expected shape: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm preview` — none of these can run yet).

## 7. License

**No license has been selected for Civit yet.** The repository contains no `LICENSE` file and no recorded license decision; [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md) tracks this as an open gap (Constitution Article X), and a license plus asset-provenance audit are required before any public release. Civit is inspired by Delphi.tools but does not use its license or claim any equivalence; nothing here grants reproduction rights to third-party products' content.

## 8. Development status and contribution expectations

Per [`docs/BUILD_STATUS.md`](docs/BUILD_STATUS.md): **Phase 0 (planning pack, agent instructions, ADR, status tracker, repository organization, and this README) is complete or awaiting checkpoint commit; Phases 1–10 have not started.** No tool, route, deployment, PWA, or Docker artifact exists. Do not describe Civit as functional, offline-capable, or production-ready.

Expectations for contributors and AI coding agents (full detail in [`AGENTS.md`](AGENTS.md)):

- Read the relevant documents in `docs/planning/` before any architectural change; resolve conflicts against the constitution first.
- A feature may be described as complete only after passing its applicable verification: type/lint/format checks, unit tests, browser tests, production-build verification, and the tool definition of done in [`docs/planning/how_to_use_this.md`](docs/planning/how_to_use_this.md). Never claim a test or command passed if it was not executed.
- Privacy rules are non-negotiable: local-only processing of user content, no accounts/analytics/trackers, Web Crypto for security-sensitive randomness, no unsanitized rendering of user input.
- Accessibility is a release requirement; every UI change must pass keyboard/screen-reader/contrast checks recorded in `docs/BUILD_STATUS.md`.
- Documentation updates (status file, ADRs, this README) are part of the work, not an afterthought.
