# Civit --- Multi-Tool Web App: Technical Implementation Plan

**Document type:** Engineering tasks / implementation handoff\
**Status:** Revised to separate online deployment from Docker/offline packaging.\
**Primary outcome:** A reproducible SvelteKit static application using Vite+, published online through Cloudflare Pages (ML model files from Hugging Face Hub) and independently packaged as an offline-capable Docker image.

**Target scope:** Stages 0–9 cover shared app/tooling. Online deployment requirements are defined in `05-ONLINE-DEPLOYMENT-PLAN.md`. Docker/offline asset localisation, packaging, and network-disabled release gates are defined in `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md` and `04-OFFLINE-FIRST-DECISIONS.md`. Any instruction below to self-host assets or disable external runtime access applies to the Docker profile unless explicitly stated otherwise.

## 1. Implementation principles

-   Keep the Vite+ migration within the toolchain/configuration layer
    unless a separate feature is approved.
-   Preserve SvelteKit ownership of routing, prerendering, and adapter
    configuration.
-   Pin and verify the actual Vite+ version rather than assuming all
    sample configuration is accepted.
-   Execute the plan in small stages; do not proceed past a blocking
    integration failure without recording the fallback decision.
-   Report checks as passed, failed, skipped, or blocked based on actual
    execution.

## 2. Task plan

### Stage 0 --- Repository and runtime baseline

-   [ ] Inspect the repository's current branch, working tree, package
    manager, and CI configuration.
-   [ ] Identify the Node.js version specified by CI or project
    metadata.
-   [ ] If no runtime version is specified, choose a supported Node.js
    version and document it before installation.
-   [ ] Confirm whether `vp` is globally installed or will be invoked
    through the project dependency.
-   [ ] Record the current baseline for install, check, unit tests,
    build, and E2E tests before changing configuration, where practical.

**Exit criteria:** Runtime and baseline state are known; no runtime
version is guessed.

### Stage 1 --- Dependency migration

-   [ ] Update `package.json` so scripts delegate to Vite+:
    -   `dev`: `vp dev`
    -   `build`: `vp build`
    -   `preview`: `vp preview`
    -   `check`: `vp check`
    -   `test`: `vp test run`
    -   `test:e2e`: `playwright test`
    -   `sync`: `svelte-kit sync`
-   [ ] Replace the direct `vite` dependency with `vite-plus` only after
    verifying the selected Vite+ package/version and its SvelteKit
    integration.
-   [ ] Remove direct Vitest, ESLint, Prettier, and Prettier plugin
    dependencies only when no longer required by the repository.
-   [ ] Retain `svelte-check` until the replacement workflow has been
    validated for Svelte files.
-   [ ] Preserve Playwright, SvelteKit, adapter-static, Svelte plugin,
    Tailwind integration, TypeScript, DaisyUI, Fuse.js, and
    lucide-svelte dependencies as required by the scaffold.
-   [ ] Pin `vite-plus` to the exact resolved version.
-   [ ] Preserve `.npmrc`:
    -   `engine-strict=true`
    -   `save-exact=true`
-   [ ] Regenerate the lockfile using the chosen package workflow and
    inspect the diff.

**Exit criteria:** Dependencies install reproducibly; the lockfile
reflects the selected toolchain; no unintentional dependency removals.

### Stage 2 --- Vite+ configuration

-   [ ] Update `vite.config.ts` to import `defineConfig` from
    `vite-plus`.
-   [ ] Keep the Tailwind and SvelteKit plugins.
-   [ ] Preserve existing Vite settings such as `server.fs.allow` if the
    project still needs them.
-   [ ] Configure the unit-test include pattern for
    `tests/unit/**/*.{test,spec}.ts` and Node environment, if accepted
    by the installed Vite+ version.
-   [ ] Configure Oxfmt preferences for 100-character lines, single
    quotes, and no trailing commas using the actual supported option
    names.
-   [ ] Configure Oxlint ignores for generated output, dependencies, and
    Playwright reports.
-   [ ] Run the installed CLI's migration or config validation workflow
    if the sample schema is rejected.
-   [ ] Avoid adding speculative config keys or relying on undocumented
    flags.

**Exit criteria:** Vite+ loads the config without schema errors; check
and test commands use the intended configuration.

### Stage 3 --- Preserve SvelteKit configuration and application structure

-   [ ] Keep `svelte.config.js` responsible for
    `@sveltejs/adapter-static`.
-   [ ] Preserve adapter output directories `pages: 'build'` and
    `assets: 'build'`, plus the existing strict/precompression/fallback
    settings unless a verified requirement demands a change.
-   [ ] Preserve the `$tools` alias.
-   [ ] Preserve strict TypeScript settings in `tsconfig.json`.
-   [ ] Preserve the shared component, search, theme, and tool registry
    structure.
-   [ ] Preserve the `base64-image-encoder` vertical slice with separate
    `Tool.svelte`, `logic.ts`, and `meta.ts`.
-   [ ] Preserve the landing and `/tools/[id]` routes.
-   [ ] Do not refactor application code as part of the toolchain
    migration unless required to fix a verified compatibility issue.

**Exit criteria:** Application architecture remains intact and SvelteKit
remains responsible for static output.

### Stage 4 --- Unit tests and type checks

-   [ ] Ensure SvelteKit sync has run before type checking when
    required.
-   [ ] Confirm `.svelte-kit/tsconfig.json` exists; run `npm run sync`
    if necessary.
-   [ ] Run `vp check`.
-   [ ] Run `svelte-check` explicitly if `vp check` does not
    demonstrably cover Svelte component diagnostics.
-   [ ] Run `vp test run`.
-   [ ] Fix failures at their source and add or update tests when
    behavior changes.
-   [ ] Record unsupported Svelte lint coverage separately; optionally
    retain a dedicated Svelte lint command if needed.

**Exit criteria:** Type checks and unit tests pass, or specific
unresolved failures are documented with evidence.

### Stage 5 --- Production build and static-output validation

-   [ ] Run `vp build`.
-   [ ] Verify that `build/index.html` exists.
-   [ ] Verify that `build/tools/<tool-id>.html` exists for every
    registered tool (for example `build/tools/base64-image-encoder.html`);
    tool routes are prerendered (Stage 9A, FR-43).
-   [ ] Verify that `build/_headers` exists.
-   [ ] Verify that `build/theme-init.js` exists.
-   [ ] Inspect generated output if `adapter-static` rejects the build
    or routes/assets are missing.
-   [ ] If Rolldown integration is the cause, use only a fallback
    supported by the installed Vite+ release; confirm any proposed flag
    exists before invoking it.

**Exit criteria:** Static build succeeds and all specified output
invariants hold.

### Stage 6 --- Preview and end-to-end smoke tests

-   [ ] Confirm `vp preview` serves the built site.
-   [ ] Update `playwright.config.ts` to run
    `vp build && vp preview --port 4173 --strictPort` only after
    verifying those flags work in the installed CLI.
-   [ ] If that orchestration fails, use a verified fallback command
    rather than assuming the bundled Vite executable is available under
    a particular invocation.
-   [ ] Install Chromium for Playwright in the test environment.
-   [ ] Run `npx playwright test`.
-   [ ] Confirm the landing route and Base64 image encoder route load in
    the built preview.
-   [ ] Capture and document browser/test failures.

**Exit criteria:** The built application can be previewed and smoke
tests pass in an environment with required browser binaries.

### Stage 7 --- Documentation and deployment handoff

-   [ ] Update README scripts and explain the `vp` workflow.
-   [ ] Document whether the project expects global `vp` or a
    project-local `vite-plus` invocation.
-   [ ] Document the verified Node.js version and install command.
-   [ ] Document any Svelte-specific lint gap and any Vite+/Rolldown
    compatibility fallback.
-   [ ] Follow `05-ONLINE-DEPLOYMENT-PLAN.md` to configure Cloudflare Pages with the verified build command and `build` output directory.
- [ ] Configure the online model-file origin (Hugging Face Hub) and verify model downloads, caching and failure states. R2 is deferred.
-   [ ] Keep the Docker asset base local and confirm no online URL is embedded in the Docker build.
-   [ ] Do not claim either deployment target is verified until a real deployment/check has been performed.

**Exit criteria:** Another developer can install, check, test, build,
preview, and deploy using the documented instructions.

### Stage 8 --- Registry schema, sidebar, and search [NEW]

**Status: COMPLETE (verified 2026-10-17).** Gates run: `vp check` pass,
`svelte-check` 0 errors/0 warnings, `vp test run` 60/60 pass, `vp build`
succeeds, Playwright 12/12 pass (incl. new sidebar/category-filter/
offline-filter tests).

-   [x] Extend the shared tool type in `src/lib/tools/types.ts` with:
    `category` (`images-assets` | `audio-video` | `typography-text`),
    `icon`, `description`, `status` (`new` | `beta` | `stable`),
    `offline` (`full` | `partial` | `online-only`), `requires`
    (subset of `wasm` | `ml-model` | `camera-mic-screen` |
    `clipboard`), and search keywords (PRD FR-21).
-   [x] Populate `meta.ts` for the `base64-image-encoder` against the
    extended type so the schema is exercised by a real tool.
-   [x] Build the sidebar grouped by the three categories, showing
    status and offline badges (FR-22).
-   [x] Extend `src/lib/search/search.ts` (Fuse.js) to index name,
    description, and keywords, and compose it with a category filter
    and a "works offline" filter (FR-23).
-   [x] Add unit tests for the extended registry type and for
    search/filter composition.
-   [x] Do not register any not-yet-approved tool; the PRD §12 catalog
    is the source of truth for what may be registered, and every tool
    remains separately approved (FR-37). *(Enforced by a unit test that
    reads the PRD catalog and fails on any unregistered/unlisted tool.)*
-   [x] Use British English in all new UI strings (FR-38).

**Exit criteria:** The extended type compiles under strict
TypeScript; the landing page shows a category-grouped sidebar with
badges; search plus both filters is covered by passing unit tests;
no unapproved tool is registered. — **Met** (evidence in the status
note above; the Base64 encoder is the only registered tool and carries
`status: new`, `offline: full` backed by the recorded network-disabled
Playwright run).

### Stage 9 --- Shared tool infrastructure [NEW]

**Status: COMPLETE (verified 2026-10-17).** Same gate set as Stage 8.
Build inspection confirms the encoder UI chunk is referenced 0 times by
the landing chunk and is pulled only via a dynamic `import()` from the
registry (FR-24); the worker chunk emits to
`_app/immutable/workers/encode.worker-*.js`.

-   [x] Add shared helpers under `src/lib/`: file input/drop-zone
    wrapper, download helper, ZIP export for multi-file output, and
    browser-capability detection that raises clear error messages when
    a required API is missing (FR-26).
-   [x] Capability detection must cover at minimum: WebAssembly,
    Web Workers, `navigator.clipboard`, `getUserMedia`,
    `getDisplayMedia`, service-worker registration, and
    `navigator.storage` (quota).
-   [x] Define the per-tool lazy-loading pattern so a tool's
    `Tool.svelte` and its heavy libraries load only on navigation to
    that tool; verify with the network panel (FR-24).
-   [x] Define the Web Worker pattern for CPU-heavy work: progress
    events to the UI and a cancel/terminate path (FR-25).
-   [x] Apply the Constitution §14 tool contract
    (`Tool.svelte`/`logic.ts`/`meta.ts`) as a checklist for new tools;
    add a unit-testable `logic.ts` convention.
-   [x] Add unit tests for the new helpers (ZIP assembly, capability
    error paths) where practical without a browser; cover the rest
    with Playwright.
-   [x] Verify by network inspection that no helper uploads user content
    or adds telemetry (FR-27). *(Source-plan evidence: the Playwright
    client-side-encoding test fails on any non-GET request, and the original
    build output contained no third-party origins at that time. This was a
    baseline observation, not a policy that blocks the planned online Hugging Face model origin; re-run the target-aware audit after configuring them.)*

**Exit criteria:** Helpers and patterns exist, are unit-tested, and
are demonstrated by a minimal refactor of the existing Base64 encoder
route (no behavior change required); lazy loading and worker
progress/cancel are demonstrated in the built preview. — **Met.**
Honest caveat: worker *cancel* is unit-tested against a mock worker
(10 cases) and wired to a Cancel button; an interactive cancel of a
large file is not covered by an automated E2E test (timing-dependent),
so it is not claimed as E2E-verified.

### Stage 9A --- Docker/offline asset audit, localisation, and tool-route prerendering [NEW]

**Status: COMPLETE (verified 2026-10-19).** This stage audits and localises assets for the Docker/offline profile only. Online references are limited to Pages and Hugging Face model files under `05-ONLINE-DEPLOYMENT-PLAN.md`. Nothing may be bundled into the Docker image before it is listed in `04-OFFLINE-FIRST-DECISIONS.md` and approved (Constitution §19, FR-41).

- [x] Step 0: run `git status` and `git diff`; identify changes to the
    offline feature and ensure only the explicitly separate Docker/offline
    target uses the no-external-runtime rule. — Done; working tree changes
    are scoped to Stage 9A (asset resolver, manifest, Dockerfile, nginx,
    vite.config.ts, package.json, credits page, root layout).
- [x] Audit the online runtime URL set and record each required origin in the online asset inventory. Separately audit the Docker profile and produce a list of external runtime references that must be eliminated from that build. — Done via `scripts/audit-runtime-urls.mjs --target=online|--target=docker`; the online allowlist contains only the same-origin Pages base plus `https://huggingface.co` / `https://cdn-lfs.huggingface.co` for pinned ML models (D-03/D-04); Docker must have none.
- [x] Add every runtime dependency/asset to the credits/licence inventory. Add only those that must be local to the Docker profile to the localisation register (name, version/source, licence, measured size, checksum when practical) and wait for owner approval. — Done in `CREDITS.md` and the credits route (both revised to "bundled + Hugging Face models only" per D-03/D-04). The localisation register (§5 below) remains empty of heavy assets; none are approved for Docker yet.
- [x] Localise the approved Docker assets. No heavy runtime assets (WASM, ML models, fonts beyond the system stack) are bundled yet; nothing is added to the localisation register until owner-approved (Constitution §19, FR-41).
- [x] Prerender tool routes: enumerate tool ids with SvelteKit
    `entries`, remove `prerender = false` from
    `src/routes/tools/[id]/+page.ts`, keep the SPA fallback for unknown
    routes, and confirm `build/tools/<tool-id>.html` exists (FR-43). — Done;
    `entries()` enumerates the five registry ids; unknown ids still fall
    back to the SPA shell and render a 404 message (D-09); `assets/manifest.json`
    `toolIds` is checked by `scripts/verify-manifest.mjs` and synced to the
    registry by `tests/unit/manifest.test.ts`.
- [x] Run each tool that currently carries `online-only` (for example
    px-to-rem, word-counter, favicon-generator, image-clipper, where
    present) against the Docker profile with external networking disabled;
    set `offline` to `full` only on a recorded pass (FR-30). Any tool that
    cannot reach `full` needs an owner-approved exception and a written
    reason in its `meta.ts`. — Done; all five registered tools now carry
    `offline: 'full'` backed by recorded Playwright runs in
    `tests/e2e/offline-tools.spec.ts` (context offline from cold reload,
    no non-GET requests, exercises upload/convert/download for each tool).
    `tests/unit/registry.test.ts` allow-list updated accordingly.
- [x] Replace per-tool "you are offline" warnings (for example in the
    Base64 encoder `Tool.svelte`) with the single global offline
    indicator (FR-44). — Done: `src/lib/components/OfflineIndicator.svelte`
    mounted once in `src/routes/+layout.svelte`; Base64 encoder's per-tool
    warning removed.
- [x] Rename the UI label "works offline" to "Offline-ready (Docker)" in the sidebar, badges, filter and tests (FR-22, FR-23). — Done in `StatusBadge.svelte`, `src/routes/+page.svelte`, `src/lib/search/search.ts`, and `tests/e2e/smoke.spec.ts`.
- [ ] Measure the ffmpeg single-thread core. If it exceeds Pages' 25 MiB cap, plan the split-and-join loader (FR-48). — Pending Stage 9A/Phase C decision; no ffmpeg core is bundled yet (D-08 requires owner approval first).
- [x] Add a target-aware build check: online output permits only the Pages/Hugging Face allowlist, while Docker output must not require external runtime asset URLs (FR-40). — Done: `scripts/audit-runtime-urls.mjs` runs in `npm run build:docker` (`--target=docker`) and via `npm run audit:online|audit:docker`; `tests/unit/manifest.test.ts` guards that the audit script's allowlist contains exactly the Hugging Face origin and no R2 origin (D-03).

**Exit criteria:** Online origin inventory and Docker asset-localisation register are complete; tool routes are prerendered; the allowlist-aware online audit passes; the Docker external-runtime audit passes; every tool released as offline-ready has a recorded Docker network-disabled run. — **Met for the five registered tools** (recorded runs against the production build with browser networking disabled). Heavy assets remain out of scope until owner-approved (D-08/D-16).

### Stage 10 --- Docker runtime asset packaging and verification [NEW]

**Status: NOT STARTED.** This stage is the Docker/offline release gate. The online PWA/service-worker cache is not a substitute for included assets and is not a prerequisite for Cloudflare Pages deployment.

- [ ] Define a build-time profile flag (for example `CIVIT_TARGET=online` or `CIVIT_TARGET=docker`) and a single asset resolver so the online build may point ML model files to Hugging Face Hub while Docker always resolves required assets locally.
- [ ] Use locked npm dependencies and build-time download scripts with pinned versions and checksums for approved heavy assets. Do not fetch assets at container runtime.
- [ ] Build the final static output and copy only production output plus required assets into the runtime image; keep Node, Vite+, npm caches and `node_modules` out of the final Nginx image.
- [ ] Confirm no production URL or environment value points to Hugging Face, R2 or any CDN in the Docker profile. Scan Docker output and inspect runtime requests.
- [ ] Confirm that all released tools marked `offline: full` run with browser networking disabled against the Docker image.
- [ ] If browser-PWA offline caching is retained for the hosted site, document it as a separate optional enhancement with separate cache/version/quota tests. Do not make its completion a condition for the online deployment.
- [ ] Keep lazy-loading by tool so the initial application shell does not fetch every tool's heavy bundle even though all required Docker assets are packaged in the image.
- [ ] Enable precompression for static text and WASM assets. Verify which Nginx image or module provides Brotli (gzip fallback otherwise), test content negotiation end to end and record the size gain (FR-46).
- [ ] Measure the Docker image and export archive size against the budget of about 300 MB or less. If over budget, stop and ask the owner (FR-45).
- [ ] Fetch heavy assets at build time with pinned versions and SHA-256 checks; confirm nothing heavy is committed to Git (FR-47).

**Exit criteria:** The Docker image is self-contained at runtime; all released tools pass the network-disabled tool tests; the online profile and Docker profile resolve their asset origins independently.

### Stage 11 --- Docker/Podman deployment and secure context [NEW]

-   [ ] Add COOP/COEP headers to `static/_headers` and to
    `nginx/default.conf` if (and only if) the Phase C decision selects
    a multi-threaded ffmpeg.wasm core; verify both serve identical
    header values (FR-31).
-   [ ] Document supported access patterns: `localhost` (secure
    context) and HTTPS origins support microphone, screen capture,
    clipboard, and service workers; plain HTTP over a LAN IP does not.
-   [ ] Make the container surface a clear in-app error when a
    secure-context feature is used from an insecure origin instead of
    failing silently (FR-32).
-   [ ] Build the image online; confirm it contains every runtime asset
    (fonts, libraries, WASM, and any approved models). Do not vendor
    `node_modules` (FR-42).
-   [ ] Run the container-specific §5 rows: startup and tool tests with
    external networking disabled, restart without internet, and air-gapped
    deployment via `docker save` / `docker load`; record the results.
-   [ ] Verify persistence behavior matches the documented policy.
-   [ ] Document the container build/run commands in the README once
    verified; do not document unverified commands.

**Exit criteria:** Header parity between static build and container is
verified (or the single-thread decision is recorded); all container
matrix rows have recorded results; insecure-origin behavior is a
documented, visible error.

### Stage 12 --- Phase A: lightweight [L] tools [NEW]

-   [ ] Confirm the inferred one-line purpose (PRD §12 Notes) for each
    Phase A tool before starting it; escalate disagreements to the PRD
    open questions rather than guessing.
-   [ ] Implement each Phase A tool as a separately approved
    increment following the Constitution §14 contract: `Tool.svelte`,
    `logic.ts`, `meta.ts`, registry entry, unit tests for `logic.ts`.
-   [ ] Phase A inventory (provisional entries marked \*): Favicon
    Generator, Image Clipper, Image De-skew, Image Masker, Image
    Splitter, Image Stitcher, Metadata Stripper, Placeholder
    Generator, Subtitle Converter, Subtitle Studio, Timecode
    Calculator, Glyph Browser, Large Type, Line Height Calculator,
    Paper Sizes, PX to REM, Text Diff, Typography Calculator, Word
    Counter; plus \*Image Atlas, \*Artwork Enhancer (non-ML scope
    only), \*Paste Image, \*Screen Recorder, \*Voice Recorder,
    \*Document Converter, \*Text Editor, \*Audio Atlas, \*Video Atlas
    --- these only after their open questions are resolved.
-   [ ] Device-permission tools ([D]) must implement the
    secure-context error path from Stage 11 (FR-32).
-   [ ] Multi-file-output tools use the shared ZIP export helper.

**Exit criteria:** Each shipped Phase A tool has a recorded
network-disabled verification, passing `logic.ts` unit tests, and an
approved increment; provisional tools are not shipped while their
purpose is unresolved.

### Stage 13 --- Phase B: library-based image/font [W] tools [NEW]

-   [ ] Select the libraries for Image Tracer, SVG Optimiser, Font
    File Explorer, and any [W] variants of Image Compressor/Converter;
    record versions and licenses (FR-35, Constitution §17).
-   [ ] Bundle the selected libraries in Docker; ensure online delivery serves the same libraries bundled from Pages (FR-28).
-   [ ] Load each library only via its tool's lazy-loading chunk
    (FR-24); route CPU-heavy tracing/optimisation through the worker
    pattern with progress and cancel (FR-25).
-   [ ] Confirm the Image Converter/Compressor [W] vs. [L] path
    decision (PRD open questions) before implementing the library
    path.
-   [ ] Verify each shipped tool with external networking disabled against
    the Docker profile after its approved library has been packaged; set
    the registry `offline` value accordingly (FR-30).

**Exit criteria:** Each shipped Phase B tool runs offline in Docker with its
approved local library, with recorded verification, licence entries, and
passing tests. Online delivery is separately tested via Pages.

### Stage 14 --- Phase C: ffmpeg-based audio/video tools [NEW]

-   [ ] Record the ffmpeg.wasm decision: exact build and version,
    single-thread vs. multi-thread, resulting COOP/COEP header
    requirement, file-size and memory limits, and the license
    obligations of that exact build (FR-31, Constitution §16/§17).
-   [ ] Ask the owner to approve the exact ffmpeg.wasm build (about 30 MB
    estimated; measure and record the real size) before downloading it.
- [ ] Use the single-thread core. Split it into pieces under 25 MiB for Pages (the browser joins them before loading, FR-48) and bundle the same approved core into the Docker image. Browser-PWA
    "make available offline" is optional and separate (FR-29).
-   [ ] Implement each Phase C tool as a separately approved
    increment: Audio Extractor, Audio Normaliser, Audio Trimmer,
    Frame Extractor, Video Muter, Video to GIF, Video Trimmer, and the
    [W] path of Waveform Generator if chosen.
-   [ ] Run ffmpeg work in a Web Worker with progress and cancel;
    enforce documented file-size/memory limits with clear error states
    rather than tab crashes (FR-25, FR-34).
-   [ ] Define per-tool codec/format fallbacks and explicit error
    states for unsupported inputs (FR-34).
-   [ ] Re-run the Stage 11 header parity check if the threading
    decision changed.
-   [ ] Verify each shipped tool with external networking disabled against
    the Docker profile after its required assets have been packaged; set
    the registry `offline` value (FR-30).

**Exit criteria:** The ffmpeg.wasm decision and licence obligations are
recorded; each shipped Phase C tool passes its Docker offline verification
with progress/cancel working; online asset delivery and any cross-origin
headers also pass their own tests; unsupported formats produce explicit errors.

### Stage 15 --- Phase D: ML tools [NEW]

-   [ ] Select the models for Background Remover, Auto Subtitle, and
    any ML Artwork Enhancer scope; record model size and license
    (FR-33, Constitution §17). Present each model (size, licence) to the
    owner and wait for approval before downloading or bundling it.
- [ ] Configure online model loading from the approved Hugging Face Hub repository and version (owner approval per model).
-   [ ] Implement each Phase D tool as a separately approved increment,
    with inference in a worker and progress/cancel (FR-25).
-   [ ] Bundle approved models in the Docker image. Browser-PWA
    "make available offline" flows are optional and separate work (FR-29).
-   [ ] Do not release an ML tool as `offline: full` in the Docker profile
    until its model is packaged locally and the network-disabled run passes
    (FR-33, FR-30).
-   [ ] Record each model's size in the credits/licenses listing
    (FR-35).

**Exit criteria:** Each shipped Phase D tool has a recorded Docker
network-disabled verification with its model local; owner approval is
recorded; registry status matches reality (no premature `full`); and
model licence/size are documented. Online model delivery is verified separately.

## 3. File-level handoff

  -----------------------------------------------------------------------
  File/path                           Required action
  ----------------------------------- -----------------------------------
  `package.json`                      Delegate standard scripts to `vp`;
                                      preserve E2E and sync scripts

  `vite.config.ts`                    Import `defineConfig` from
                                      `vite-plus`; configure plugins,
                                      tests, formatter, and linter using
                                      verified schema

  `svelte.config.js`                  Preserve adapter-static and
                                      SvelteKit-specific settings

  `tsconfig.json`                     Preserve strict compiler settings

  `.npmrc`                            Preserve strict engine and
                                      exact-save behavior

  `playwright.config.ts`              Verify build/preview orchestration
                                      and port flags

  `README.md`                         Document verified commands,
                                      runtime, and deployment output

  `static/`                           Preserve headers, favicon, robots
                                      file, and theme initialization

  `src/lib/`                          Preserve shared components, search,
                                      theme, and tool registry

  `src/routes/`                       Preserve landing and dynamic tool
                                      routes

  `tests/unit/`                       Preserve and run Base64 encoder
                                      unit tests

  `tests/e2e/`                        Preserve and run Playwright smoke
                                      tests
  -----------------------------------------------------------------------

### Additional file-level handoff for Stages 8-15 [NEW]

| File/path | Required action |
|---|---|
| `src/lib/tools/types.ts` | Extend with category, icon, description, status, offline, requires, search keywords (FR-21) |
| `src/lib/tools/registry.ts` | Register only approved tools; keep in sync with the PRD §12 catalog |
| `src/lib/tools/<tool-id>/` | One directory per tool: `Tool.svelte`, `logic.ts`, `meta.ts` (Constitution §14) |
| `src/lib/search/search.ts` | Fuse.js over name/description/keywords plus category and offline filters (FR-23) |
| `src/lib/` shared helpers | File input/drop, download, ZIP export, capability detection (FR-26) |
| Web Worker modules | Per-tool workers with progress/cancel pattern (FR-25) |
| `static/_headers` | Preserve; add COOP/COEP only if multi-threaded ffmpeg.wasm is selected (FR-31) |
| Profile-specific asset resolver / `static/` | Online build resolves Hugging Face model URLs and serves everything else from Pages; Docker build includes approved local WASM/model assets and never requires external runtime URLs (FR-28) |
| PWA/service-worker files | Add per the Stage 10 decision (SvelteKit-native vs. plugin); the existing `static/sw.js` fate is part of that decision |
| `nginx/default.conf` | Mirror COOP/COEP header parity with `_headers` when required; keep SPA fallback |
| Container Dockerfile/compose | Preserve; verify offline startup rows of the §5 matrix (FR-17) |
| Credits/licenses surface | New page or section listing third-party WASM/models/libraries/fonts (FR-35) |
| `tests/unit/` | Add tests for registry schema, search/filters, shared helpers, and each tool's `logic.ts` |
| `tests/e2e/` | Extend smoke tests to sidebar/search/filters and per-tool offline runs |
| `src/routes/tools/[id]/+page.ts` | Remove `prerender = false`; add `entries` that enumerate registered tool ids (FR-43) |
| Fonts and CSS | Both profiles bundle fonts and CSS; no runtime CDN (FR-40) |
| Build check script | Online build enforces an origin allowlist; Docker build fails if required runtime assets reference external URLs (FR-40) |
| `tests/e2e/` offline suite | Playwright with `context.setOffline(true)` loading every tool and reloading a tool URL (FR-39, FR-43) |
| Dockerfile / README | Online build, offline runtime; document `docker save` / `docker load` and `--network none` runs once verified (FR-42) |
| `04-OFFLINE-FIRST-DECISIONS.md` | Record owner decisions for Docker-localised assets; online asset origins and licences are tracked in `05-ONLINE-DEPLOYMENT-PLAN.md` (FR-41) |

## 4. Suggested commands

Run only the commands supported by the selected installation workflow.

``` bash
# Optional global installation on macOS/Linux, as described in the source:
curl -fsSL https://vite.plus | bash

# From the repository root:
vp install
vp check
vp test run
vp build
vp preview

# Install browser dependencies if needed:
npx playwright install --with-deps chromium
npx playwright test
```

For CI, prefer a project-pinned `vite-plus` dependency and `npx vp` if
this is compatible with the repository's selected package workflow. The
source also describes `npm run sync` as an explicit SvelteKit sync
escape hatch.

## 5. Deployment verification matrices

### 5.1 Online Cloudflare Pages + Hugging Face (models)

| Scenario | Method | Expected result |
|---|---|---|
| Production build | Run the verified Vite+ build command in Pages with the pinned Node version | Build succeeds and publishes `build/` |
| Public routes | Open the root and every `/tools/<tool-id>` URL directly; reload each | Static routes work without depending on a development server |
| Large assets | Load the ffmpeg core pieces from Pages and a model from Hugging Face | Pieces join and load; correct MIME type; model downloads succeed and are cached; no use of `r2.dev` |
| Cross-origin dependencies | Inspect browser network requests | Only Pages and Hugging Face Hub (model files) are used |
| Lazy loading | Open the landing page, then individual tools | Tool-specific libraries and large assets are fetched only when needed |
| Privacy | Run representative tool workflows with network inspection | No user files/results are uploaded and no analytics/telemetry is emitted |
| Budget | Review Pages usage metrics (and R2 if adopted) | Usage is within current free-tier allowances or a deliberate cost decision is recorded |
| Updates | Deploy a new version of content-hashed assets | Old cacheable URLs remain immutable; mutable entry documents can discover the new release |

### 5.2 Docker/offline release

| Scenario | Method | Expected result |
|---|---|---|
| Asset completeness | Inspect final image contents and asset manifest | Every approved runtime dependency required by released tools is present locally |
| No external asset base | Build the Docker profile and inspect compiled asset URLs | No required runtime asset references R2/CDNs |
| Offline startup | Start the completed image with external network access disabled | Nginx serves the app and required assets without external requests |
| Tool execution offline | Disable browser network and run each released tool against the Docker build | Every tool marked `offline: full` completes its workflow |
| Direct route reload | Open/reload `/tools/<tool-id>` URLs | Prerendered route files are served correctly |
| Save/load | Export image with `docker save`, transfer, import with `docker load` on an offline system | Container starts without pulling image layers or dependencies |
| Headers | Check container responses; check online Pages where relevant | COOP/COEP and WASM MIME/CORS behavior matches the selected threading/delivery strategy |
| Privacy | Inspect request logs and browser network trace | No user-content uploads, telemetry or required external runtime requests |
| Rebuild reproducibility | Rebuild from lockfile and approved asset manifest | Versions/checksums and output are reproducible; updates are deliberate |
| Image size budget | Measure the image and export archive | Within about 300 MB or less, or the owner approves an exception (FR-45) |
| Compression | Request `.wasm` and `.js` with `Accept-Encoding` | Precompressed response served; size gain recorded (FR-46) |

### 5.3 Optional browser-PWA offline enhancement

This is not a release gate for the online deployment unless explicitly brought back into scope. If implemented, test cache population, reload offline, tool execution, version updates, interrupted downloads, quota errors, and whether cross-origin assets can actually be cached under the configured CORS policy.

## 6. Risk register

  -------------------------------------------------------------------------------
  Risk                      Impact                  Mitigation
  ------------------------- ----------------------- -----------------------------
  Vite+ config schema       Checks or build fail at Validate against installed
  differs from scaffold     startup                 version; use supported
  example                                           migration/config output

  Oxfmt option names differ Formatting              Run check/fix and confirm
                            configuration rejected  effective options
                            or ignored              

  Oxlint lacks Svelte       Svelte-specific lint    Keep `svelte-check`;
  parsing/rules             coverage incomplete     optionally add a separate
                                                    Svelte lint command

  `vp check` does not sync  Type-check fails on     Run `svelte-kit sync` and
  SvelteKit state           missing generated       verify
                            config                  `.svelte-kit/tsconfig.json`

  `vp preview` flags differ E2E web server does not Verify flags and use a
                            start                   confirmed fallback

  Rolldown output conflicts Production build fails  Validate output and use a
  with adapter-static       or output is incomplete verified compatibility path

  Runtime/package-manager   Install or CI failures  Follow repository CI runtime
  mismatch                                          and pin toolchain versions
  -------------------------------------------------------------------------------

### Additional risks for Stages 8-15 [NEW]

| Risk | Impact | Mitigation |
|---|---|---|
| ffmpeg.wasm multi-threading requires COOP/COEP, which can break cross-origin isolation assumptions (e.g. `window.parent`, some embeds) or be unsupported on the deployment target | Tools break on one deployment path but not the other | Verify headers on both Cloudflare Pages output and the container before shipping; keep the single-thread build as a documented fallback |
| ffmpeg.wasm file-size/memory limits cause tab crashes on large media | Poor UX; lost work | Enforce documented limits with clear errors; run ffmpeg in a worker; test with representative large files |
| ffmpeg.wasm license obligations of the exact build are non-trivial | Compliance risk | Record the exact build and its license before Phase C; add to credits/licenses; do not ship until verified |
| Secure-context features silently fail over plain-HTTP LAN access to the container | User-visible breakage of mic/screen/clipboard/PWA features | Document supported access patterns; add explicit capability errors (FR-32) |
| ML model weights are large; bundling and caching may exceed typical storage quotas or bloat the image | Large image; quota errors for PWA-only use | Record measured sizes, ask the owner before bundling each model, prefer smaller or quantised models, and ship Phase D last |
| Browser codec/format support varies (MediaRecorder, image encoders, audio decode) | Tool fails on some browsers | Per-tool fallbacks and explicit error states (FR-34); define a browser baseline |
| Service-worker cache serves stale tool code after updates | Broken tool versions | Versioned caches; tested update flow (Stage 10) |
| Hugging Face-hosted model (or other third-party asset) licence, availability or version is unsuitable | Legal/security risk; rework | Verify licence, provenance, version pinning, integrity where available, and include it in credits (FR-35) |
| Registering unapproved tools from the catalog by accident | Scope creep | Registry only accepts approved tools; per-tool approval gate (FR-37) |
| Safari/iOS evicts cached data or has small quotas for optional PWA use | Cached assets may disappear | Do not promise browser offline availability without tests; Docker remains the self-contained offline target |
| Vendored fonts or libraries have licence obligations | Compliance risk | Register each asset with licence before adding it (FR-35, FR-41) |
| Image build needs the internet and base images are missing on the offline machine | Air-gapped deployment fails | Export the built image with `docker save`, including base images; verify on a clean offline machine (FR-42) |
| Prerendered tool routes drift from the registry | Missing or stale tool HTML | Enumerate ids from the registry via `entries`; assert files exist in the build check (FR-43) |
| Hugging Face throttles or is unavailable during a demo | Online ML tools fail | Anonymous limits are per IP and generous for a few visitors; models are cached in the browser after first load; use the Docker image as the fallback; the model host is a setting that can point to a mirror |
| Split ffmpeg core fails to join or load | Phase C tools broken online | Test the split-and-join loader in the built site early; measure the real core size first (FR-48) |
| Docker image exceeds the size budget | Slow transfer, heavy repo/registry use | Prefer small quantised models, avoid duplicates, measure early, stop and ask before adding more (FR-45) |

## 7. Definition of done

The handoff is complete when:

-   [ ] Runtime and package versions are recorded and reproducible.
-   [ ] Vite+ configuration validates against the installed release.
-   [ ] `vp check` passes, including Svelte-specific checks required by
    the project.
-   [ ] `vp test run` passes.
-   [ ] `vp build` passes and the required files exist in `build/`.
-   [ ] `vp preview` serves the generated output.
-   [ ] Playwright smoke tests pass, or their environment-specific
    blocker is documented.
-   [ ] README and deployment settings reflect verified commands.
-   [ ] All unverified assumptions and unresolved failures are
    explicitly listed.
-   [ ] [NEW] The extended registry schema (FR-21) compiles and every
    registered tool has category, icon, description, status, offline,
    requires, and search keywords populated.
-   [ ] [NEW] Sidebar grouping, Fuse.js search, category filter, and
    "Offline-ready (Docker)" filter pass unit tests and manual checks (Stages
    8-9).
-   [ ] [NEW] Shared helpers (file input/drop, download, ZIP export,
    capability detection) exist with tests, and tools use them.
-   [ ] [NEW] CPU-heavy tools run in workers with demonstrated
    progress and cancel (Stage 9).
-   [ ] [NEW] If browser-PWA caching is retained, its integration choice
    (SvelteKit-native vs. Vite+-compatible plugin) is verified with evidence
    and tracked as separate work; it is not required for Pages launch.
-   [ ] [NEW] Every row of the §5 matrix --- original and added ---
    has a recorded pass, a recorded failure, or a documented blocker;
    no offline claim exists without a recorded network-disabled run
    (Stages 10-11).
- [ ] [NEW] Online ML models load from approved Hugging Face repositories and everything else from Pages;
    Docker bundles its required assets and makes no external runtime requests
    (FR-28).
-   [ ] [NEW] Browser-PWA "make available offline" size/quota handling is
    checked only if this optional feature is implemented (FR-29).
-   [ ] [NEW] Supported secure-context access patterns are documented
    and insecure origins fail visibly (FR-32).
-   [ ] [NEW] ffmpeg.wasm build, threading mode, limits, and license
    obligations are recorded; header parity is verified if
    multi-threading is enabled (FR-31).
-   [ ] [NEW] ML tools are not released until their model is local, owner
    approval is recorded, and a network-disabled run passes (FR-33).
-   [ ] [NEW] The credits/licenses listing exists and covers all
    third-party assets (FR-35).
-   [ ] [NEW] Each shipped tool follows the `Tool.svelte`/`logic.ts`/
    `meta.ts` contract, is in the PRD §12 catalog, and was separately
    approved (FR-36, FR-37).
-   [ ] [NEW] No out-of-scope feature (other categories, featured
    section, favorites/recents, tool-to-tool hand-off, CLI, accounts,
    analytics) was built.
-   [ ] [NEW] The Docker/offline build and every released tool pass
    network-disabled Playwright checks and container startup with
    external networking disabled (FR-39).
-   [ ] [NEW] The online origin allowlist audit and Docker no-external-runtime-asset audit both pass (FR-40).
-   [ ] [NEW] Every localised asset has an owner approval in the
    localisation register (FR-41).
-   [ ] [NEW] The image builds online, runs offline, and loads on a clean
    offline machine via `docker save` / `docker load` (FR-20, FR-42).
-   [ ] [NEW] Tool routes are prerendered, `build/tools/<tool-id>.html`
    exists for every registered tool, and a direct reload works offline
    (FR-43).
-   [ ] [NEW] Connection/offline state is accurate and never implies that
    uncached online assets are available offline (FR-44).
-   [ ] [NEW] The Docker image is within the size budget (FR-45), static assets are precompressed (FR-46), and no heavy asset is committed to Git (FR-47).
-   [ ] [NEW] Every online file is under Pages' 25 MiB limit and the split ffmpeg core loads correctly (FR-48).

## 8. Handoff note

The supplied text is a proposed scaffold and explicitly calls out
version-sensitive areas. Treat its sample package versions and
configuration as starting points, not proof that the exact combination
currently installs or builds. Verify against the repository's actual
package metadata, lockfile, CI, and installed Vite+ version before
declaring the migration complete.

[NEW] Stages 8-15 extend the handoff beyond the toolchain migration to
the three-category tool catalog (44 tools, PRD §12). Treat every tool
as a separately approved increment: the stage inventories are
plans, not approvals. Nothing in this plan may be reported as verified
until it has actually been run and its result recorded; in particular,
no tool may be labelled offline, and no dependency's license may be
listed as verified, on the basis of this document alone.

[NEW] Docker/offline decisions and the localised-asset register are recorded in
`04-OFFLINE-FIRST-DECISIONS.md`; online publishing/asset delivery is defined in
`05-ONLINE-DEPLOYMENT-PLAN.md`. Size figures are estimates until measured.
Docker-localised dependencies, fonts, WASM binaries, and models must be listed
and approved before bundling; heavy features (FFmpeg and ML models) require an
explicit per-asset decision.
