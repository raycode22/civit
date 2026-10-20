# Civit Technical Implementation Plan

**Status:** Proposed; execute in stages  
**Primary architecture:** Astro static site + Svelte 5 tool islands + TypeScript tool engines  
**Package manager:** pnpm  
**Initial build target:** static `dist/` directory

## 1. Architecture decisions

| Concern | Initial decision | Rationale / revisit condition |
|---|---|---|
| Site shell and routes | Astro static output | File-based routes and static HTML are appropriate for a catalogue of independent tools. Avoid server rendering and adapters while no server behavior is required. |
| Interactive tools | Svelte 5 components through `@astrojs/svelte` | Use `client:load` for the active tool’s interactive UI; defer below-the-fold or non-critical widgets. Do not hydrate every tool in the site. |
| Language | TypeScript strict mode | Tool contracts, registry metadata, and browser capability checks benefit from compile-time constraints. |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`; daisyUI 5 (CSS `@plugin`) with custom Catppuccin Latte/Mocha themes; CSS variables for design tokens | Use a single current integration path rather than mixing Tailwind v3 and v4 setup. Keep semantic CSS variables independent of utility classes. Selected in Prompt 1B revision — see `docs/design/catppuccin-style-guide.md`. |
| Accessible primitives | Bits UI for controls that benefit from built-in keyboard/focus behavior | Use selectively. A headless library does not remove the need for accessibility tests. Avoid importing large component bundles into the home page. |
| Package manager | pnpm with committed lockfile | Reproducible installs and efficient dependency management. Use the package-manager version field and Corepack or the CI setup action. |
| Unit tests | Vitest | Fast TypeScript unit tests for deterministic logic and parsers. |
| Browser tests | Playwright | Validate real browser behavior, direct route loading, keyboard flows, file input/output, and offline scenarios later. |
| Lint/format | ESLint + Prettier, or a consciously chosen single-tool alternative | Choose versions compatible with the selected Astro/Svelte toolchain at project initialization and pin them. Avoid overlapping style engines. |
| PWA | `@vite-pwa/astro` + Workbox, after online stage | The integration exists, but configuration and current compatibility must be confirmed at implementation time. Keep heavy models outside precache. |
| Worker RPC | Native typed worker messaging first; Comlink where it meaningfully simplifies RPC | Small calculators do not need worker proxies. Heavy transforms should use workers. Avoid wrapping every pure function in worker infrastructure. |
| High-performance kernel | TypeScript first; optional Rust/WASM for selected hotspots | Browser APIs and many utility tasks are naturally JavaScript-based. A shared Rust core does not automatically produce identical behavior or better performance across all tools. |
| Monorepo orchestration | No Turborepo initially | One web package does not justify another build scheduler. Add workspace packages and Turbo when a CLI, shared library, or separate WASM packages appear. |
| Hosting | Cloudflare Pages static site per requested plan | No Functions or backend needed. Keep build output portable. Cloudflare currently recommends Workers for new projects generally; Pages still supports static deployments, so revisit this choice if server capabilities or product direction change. |
| Large immutable model/engine assets | Cloudflare R2 custom domain or separate distribution, downloaded on demand | Cloudflare Pages has a hard 25 MiB individual asset limit. Never commit a ~110 MB model as an ordinary Pages output asset. |
| Docker runtime | Non-root Nginx static image, multi-stage build | Same static artifact; no Node process in runtime image. Provide a distinct offline bundle when local models need to be embedded. |

## 2. High-level system view

```text
Browser
├── Astro-generated static pages
│   ├── global navigation, search, categories, metadata
│   └── dedicated tool routes
├── Svelte 5 interactive islands
│   ├── tool input/output UI
│   ├── local preferences (limited, user-controlled)
│   └── optional install/offline status UI (PWA stage)
├── Tool engines (TypeScript modules)
│   ├── deterministic logic and validation
│   ├── browser-native APIs (Canvas, Web Crypto, File APIs)
│   └── optional Web Workers for heavy computation
├── Optional heavy engines (later)
│   ├── WASM/FFmpeg/PDF libraries
│   └── opt-in model and engine assets from R2 or bundled Docker files
└── Browser-managed storage (later)
    ├── service worker + Cache Storage for application resources
    └── IndexedDB only for metadata/state that needs structured persistence

Build/Release
├── pnpm install --frozen-lockfile
├── lint + typecheck + tests + static build
├── CI artifact and dependency/security checks
└── static dist/ → Cloudflare Pages or container image
```

There is no user-content backend in the initial architecture. The future use of R2 is for public, versioned engine/model binaries, not for uploading user files or persisting their output.

## 3. Repository layout

Start with one root package. Keep boundaries explicit so a workspace can be introduced without restructuring every tool.

```text
civit/
├── public/
│   ├── _headers
│   ├── favicon.svg
│   ├── icons/
│   └── manifest.webmanifest       # added during PWA stage
├── src/
│   ├── components/
│   │   ├── app/                   # shell, navigation, search
│   │   ├── tool/                  # shared tool page patterns
│   │   └── ui/                    # accessible reusable primitives
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── category/[category].astro
│   │   └── tools/[slug].astro     # or generated individual routes, based on registry strategy
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   ├── tools/
│   │   ├── registry.ts
│   │   ├── contracts.ts
│   │   ├── developer/
│   │   │   ├── json-formatter/
│   │   │   │   ├── JsonFormatter.svelte
│   │   │   │   ├── engine.ts
│   │   │   │   └── engine.test.ts
│   │   │   └── ...
│   │   ├── text/
│   │   ├── colour/
│   │   ├── images/
│   │   └── other/
│   ├── lib/
│   │   ├── browser-capabilities.ts
│   │   ├── download.ts
│   │   ├── file-validation.ts
│   │   ├── safe-svg.ts
│   │   └── errors.ts
│   └── workers/                  # introduced when a tool requires workers
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── accessibility/
├── scripts/
├── astro.config.mjs
├── svelte.config.js
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── pnpm-lock.yaml
├── .npmrc
├── .nvmrc                        # pin supported Node release used by CI
└── Dockerfile                    # added in Docker stage
```

If a dynamic registry-driven page proves awkward for Astro’s static route generation or the content format, prefer explicit route generation/build-time enumeration over switching the whole product to an SPA. Every declared route must be emitted as static HTML and verified in the built output.

## 4. Tool registry contract

The registry is the single source for display metadata and discovery. Avoid importing every implementation eagerly from the home page. Route-level dynamic imports or static build-time route generation should prevent tool engines from entering unrelated bundles.

A registry entry should include:

- stable `id` and `slug`;
- display name, short description, category, tags, search keywords;
- component/loader identifier;
- whether the tool accepts text, files, camera/microphone/display input, or external model assets;
- expected output types and export actions;
- estimated asset weight class (`small`, `medium`, `large`);
- offline support level (`core`, `optional-engine`, `online-only`);
- supported browser capability predicates;
- privacy notes and tool-specific size limits.

Validate registry data at build/test time: no duplicate IDs/slugs, no missing category, no unresolved route/implementation, and no unsupported public entries. Avoid runtime metadata fetched from a remote service.

## 5. UI and state boundaries

- Astro owns route composition, metadata, and content that can be rendered at build time.
- Svelte owns the active interactive tool state.
- Tool engines should be pure functions where practical. Browser API wrappers should have small interfaces so they can be mocked in unit tests.
- Do not build a global state manager until multiple routes truly need shared mutable client state. Theme and small preferences can use a tiny store/local storage wrapper.
- Do not persist raw input values globally by default. File inputs should be cleared after use where appropriate, object URLs revoked, and large arrays/buffers released.
- Tool errors should be typed internally (`InvalidInput`, `UnsupportedFormat`, `CapabilityUnavailable`, `ResourceLimit`, `Cancelled`, `Unexpected`) and rendered as concise user-facing feedback.

## 6. Engine and worker policy

### Use synchronous TypeScript for

- simple converters/calculators;
- small string transforms;
- JSON formatting within reasonable, configurable input limits;
- metadata calculations that complete quickly.

Add input limits and prevent pathological inputs from causing runaway CPU or memory usage.

### Use Web Workers for

- large text diffs or parsing when profiling shows long tasks;
- image operations on large images;
- PDF rendering/transformation;
- media processing or model inference;
- CPU-heavy algorithms that would freeze interaction.

Worker messages must be typed and versionable. Transfer `ArrayBuffer`s where ownership transfer is appropriate to avoid unnecessary copies. Define termination, cancellation, progress, and error handling for worker operations. Do not assume cancellation can stop every WASM call; design tool UI accordingly.

### Optional Rust/WASM gate

Introduce a Rust crate only after profiling identifies a computation that benefits from it or a native CLI becomes a real product requirement. Evaluate each crate for `wasm32-unknown-unknown` compatibility, browser-side I/O requirements, thread assumptions, memory use, code size, license, and test support. Isolate filesystem/network operations at the caller boundary. Keep browser APIs in TypeScript adapters. A shared Rust algorithm can improve parity but does not guarantee perfect parity between native and browser adapters or dependencies.

### Multi-threaded WASM gate

Use single-thread WASM or worker-based execution first. Multi-threaded WASM that relies on `SharedArrayBuffer` requires cross-origin isolation in supported browsers, normally involving COOP/COEP headers. Test every cross-origin runtime and model asset with those headers before enabling them globally. Keep a single-threaded fallback where feasible.

## 7. Dependency policy

### Baseline dependencies (proposed)

- `astro`
- `@astrojs/svelte`
- `svelte` (version 5 line)
- `tailwindcss` + `@tailwindcss/vite`
- `bits-ui` only for primitives actually used
- `typescript`
- `vitest`
- `@playwright/test`
- `eslint`, `prettier`, their Astro/Svelte integrations, and TypeScript-aware configuration as chosen

Add `@vite-pwa/astro` only in the PWA stage. Add `comlink` only when worker call sites warrant it. Add `wasm-bindgen`/`wasm-pack`, Rust toolchain, `pdf-lib`, PDF.js, ffmpeg.wasm, ONNX Runtime Web, or model-specific dependencies only alongside a defined feature and its size/license/test plan.

Before accepting each package, review: maintenance/release cadence, open security advisories, license, transitive dependencies, supported browsers, side-effect/tree-shaking behavior, ESM/workers compatibility, compressed bundle delta, and whether a built-in API suffices.

Pin dependency versions in the lockfile. Do not copy exact library versions from planning notes into production without checking current official installation docs and compatibility warnings at implementation time.

## 8. Engineering workflow and quality gates

Every PR must pass, at minimum:

1. frozen dependency install;
2. formatting and lint;
3. TypeScript/Astro/Svelte checks;
4. unit tests;
5. production static build;
6. route/registry validation;
7. dependency and secret scans;
8. browser tests for changed critical flows;
9. bundle report for changes to global or shared dependencies.

After the PWA stage, add service-worker generation checks and offline browser tests. After the Docker stage, build the image in CI, inspect the image size, run a container smoke test, and verify headers/MIME types.

Keep test layers distinct:

- **Unit:** deterministic parsing, conversion, calculations, input validation.
- **Component/browser:** keyboard interaction, input state, status, export, responsive states.
- **Integration:** tool + worker, tool + browser file APIs, model download/cache lifecycle.
- **End-to-end:** direct route loading, representative complete tasks, offline/reload/update, container route and asset delivery.

## 9. Implementation stages and exit gates

### Stage 0 — foundation (no user-facing breadth)

- Initialize repository and pin Node + pnpm versions used by CI.
- Create Astro static project and add Svelte 5 integration.
- Add Tailwind v4 through the Vite integration; introduce CSS variables for theme tokens.
- Configure TypeScript strictness, lint/format, Vitest, Playwright, lockfile and PR CI.
- Implement application shell, routes, registry schema, search, category pages, 404, error boundary equivalent, and privacy statement.
- Establish output-size report and a first deployed preview.

**Exit gate:** fresh clone builds without undeclared global dependencies; all public routes resolve; deployment preview is reproducible; no tool placeholders are listed as finished tools.

### Stage 1 — online MVP

- Implement 5–10 complete tools, prioritized by PRD.
- Add tests, limits, accessibility behavior, feature detection, and export/copy functionality.
- Test the deployed URLs, browser matrix, privacy/network boundary, and performance baselines.
- Deploy to Cloudflare Pages as a static build; retain the ability to roll back by reverting the main branch.

**Exit gate:** PRD’s online MVP acceptance criteria pass. Do not add service-worker caching until cache/update behavior can be tested with a known stable app.

### Stage 2 — PWA base

- Add manifest/icons and `@vite-pwa/astro`/Workbox.
- Cache the app shell and a bounded, intentionally selected set of small static assets/routes.
- Add an offline page and a visible offline readiness/status model.
- Add versioned cache cleanup and an update notification/refresh flow that avoids breaking an in-progress tool operation.
- Test fresh install, first visit, second visit, network disabled, hard reload, app update, and cleared site data.

**Exit gate:** supported browsers can use advertised core tools after an online warm-up with the network disabled, and the app recovers after cache deletion/update. No large model is part of automatic precache.

### Stage 3 — heavy offline engines

- Add one candidate heavy tool at a time.
- Place large immutable asset files on R2 under versioned/hash-based names; configure CORS and correct MIME/cache headers.
- Add opt-in download, expected size, integrity validation, progress, cancel/retry, quota estimate, removal, and tool-specific offline readiness status.
- Benchmark memory/time on target devices and use worker execution.

**Exit gate:** the feature can be downloaded, validated, used offline, updated without stale-code mismatch, removed from local storage, and recovered after interrupted download/QuotaExceededError.

### Stage 4 — Docker

- Build the site, then package only static `dist` assets in a non-root web server image.
- Reproduce relevant security/cache headers in Nginx; Cloudflare’s `_headers` file does not apply inside Docker.
- Make local binding default to `127.0.0.1` in example run commands.
- Provide a light image and a clearly separate offline-assets build flow when model weights are intentionally included.
- Run container tests in CI and document image size, ports, HTTPS considerations, update and backup behavior.

**Exit gate:** image builds from a clean checkout, serves direct routes and WASM with correct MIME, runs as non-root, and its promised local capabilities work without public network access.

### Stage 5 — scale product breadth

Use PRD waves and the definition of done in `how_to_use_this.md`. Consider a pnpm workspace/Turborepo when independently built packages exist. Consider a Rust CLI only after command-line workflows or shared domain logic justify it. Add workflow chaining only after stable typed tool contracts exist.

## 10. Performance and memory safeguards

- Use `createImageBitmap`, Canvas/OffscreenCanvas, `Blob`, object URLs, and transferable buffers carefully; feature-detect optional APIs.
- Revoke object URLs in cleanup paths.
- Impose practical input size/dimension limits before decoding files. Guard against extremely large images and archive/decompression bombs.
- Do not keep multiple decoded versions of a file in component state unless required.
- Dispose/terminate workers when the route unmounts or the task ends.
- Model sessions need explicit lifecycle and memory checks. Do not assume that caching a model means it will fit in runtime memory on low-end phones.
- Capture baseline memory/runtime on representative devices before promoting media/ML functions from experimental to stable.

## 11. Build and deployment portability

The build output should be ordinary static files. Avoid relying on runtime environment variables inside browser bundles; public build-time settings are visible to users, and secrets must never be embedded in the client. Use relative/static URLs configured for the eventual domain and validate base-path assumptions during local preview, Pages preview deployments, custom-domain deployment, and Docker.

Keep platform wiring shallow:

- Cloudflare-specific files: `public/_headers` and host configuration.
- PWA-specific files: service-worker config and manifest.
- Container-specific files: Dockerfile and Nginx config.
- Core tool engines and UI should not import Cloudflare SDKs or Docker-specific configuration.
