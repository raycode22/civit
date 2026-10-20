# How to Use These Civit Project Documents

These documents define a staged implementation plan for **Civit**, a local-first browser utility suite inspired by the product direction described in the supplied Delphi.tools research. They are intended to be used as the project’s initial working agreement and planning baseline, not as a claim that the application has already been implemented or tested.

## Read in this order

1. **`01-constitution.md`** — the non-negotiable product and engineering rules. Resolve conflicts against this document first.
2. **`02-prd.md`** — what Civit should ship, who it serves, what is out of scope, and how success is measured.
3. **`03-technical-implementation-plan.md`** — the code structure, architecture decisions, engineering standards, and stage gates.
4. **`04-online-deployment-plan.md`** — how to ship the first static online release to Cloudflare Pages.
5. **`05-offline-pwa-plan.md`** — how to introduce offline operation after the online app is stable.
6. **`06-docker-build-plan.md`** — how to package and run the app locally after the web build is stable.
7. **`07-research-and-stack-validation.md`** — the evidence behind the stack, revised assumptions, known limitations, and links to current documentation.

## How to execute the roadmap

Treat the stages as a sequence of independently releasable increments. Do not start the next stage merely because the code compiles. Start it when the previous stage’s acceptance gates pass and the deployment artifact is reproducible.

| Stage | Outcome | Do not proceed until |
|---|---|---|
| 0. Foundation | Repository, CI, design tokens, tool registry, privacy baseline | A clean checkout installs, tests, type-checks, builds, and produces deterministic static output |
| 1. Online MVP | Public Civit site and a small useful set of tools | Production Pages deployment, direct routes, privacy checks, accessibility smoke tests, and browser tests pass |
| 2. PWA foundation | Installable app with reliable offline shell and cached core routes | Offline tests pass in a real browser profile; update and recovery behavior are proven |
| 3. Offline-capable heavy tools | Explicit model/engine downloads and cache management | Storage quota failures, interrupted downloads, model versioning, and cache eviction are handled |
| 4. Docker | Reproducible static container and documented local run | Container serves correct headers/routes, runs as non-root, and works without public-network access for included capabilities |
| 5. Expansion | More tools, optional Rust/WASM kernels, media/PDF capabilities | Each new capability meets tool-specific performance, licence, browser-support, and offline acceptance criteria |

## Working rules

- The supplied research is the starting point for product direction. The research-validation document records which technical claims were confirmed, revised, or deferred.
- Keep decisions current. If an official vendor document changes a deployment limit or framework requirement, revise the relevant plan and leave a short decision note in the pull request.
- Pin dependencies through `pnpm-lock.yaml`. Do not rely on globally installed tools or floating production dependencies.
- Make one complete tool vertical slice before building a large set of empty routes: registry entry, UI, computation, tests, errors, privacy review, and documentation.
- Keep the application static and client-only during the online MVP. Do not add an API, authentication, database, analytics SDK, or file-upload backend without revisiting the constitution and PRD.
- Use `pnpm` as the JavaScript package manager. Add Turborepo, a Rust workspace, or other monorepo machinery only when there is a real package/build orchestration need.
- Avoid claiming that something is private, offline, or supported until tests prove the claim. For example, a PWA cannot guarantee persistent storage because a browser can clear or evict it.

## Definition of done for a tool

A tool is not done when its happy path appears to work. It is done when all of the following are true:

- It has documented input/output behavior and limits.
- It validates inputs and handles empty, malformed, oversized, and unsupported input.
- It does not upload or persist user content unless that behavior is explicitly designed, documented, and user-controlled.
- Heavy work does not freeze the user interface; a worker is used where measurements or the operation’s known cost justify it.
- It has unit tests for deterministic logic and browser tests for important user flows.
- It provides keyboard-accessible controls, visible progress where needed, and actionable error messages.
- Its browser support and format support are based on feature detection rather than assumed codec availability.
- It has been tested in a production build, not only the development server.
- Its offline capability is labeled accurately: **available offline**, **available after downloading its engine/model**, or **online-only**.

## Project-specific terms

- **Tool registry:** typed metadata describing each utility, its route, category, search terms, implementation, capabilities, and offline requirements.
- **Tool engine:** the pure or mostly pure computation used by a tool, separate from its UI.
- **Heavy asset:** a large WASM module, model, codec runtime, font set, or other binary that should not be included in the default application precache.
- **Offline-ready:** the app has the required UI/code/data cached and the tool’s complete runtime path can execute with network access disabled. Installing the PWA alone does not make every tool offline-ready.
- **Core versus optional offline bundle:** the core bundle contains the site and small built-in utilities; optional bundles include large models or engines that a user explicitly chooses to download.

## Updating these documents

When requirements change, update the PRD and the relevant implementation/deployment plan in the same change. Keep the constitution stable; modify it only when a product principle genuinely changes. Record technical choices that are costly to reverse—framework changes, persistence, telemetry, remote processing, licensing, or deployment architecture—as short architecture decision records (ADRs).
