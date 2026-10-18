# Civit --- Technical Implementation Plan

**Document type:** Engineering tasks / implementation handoff\
**Status:** Proposed plan derived from the supplied scaffold\
**Primary outcome:** A reproducible, validated SvelteKit static
application using Vite+ as its toolchain

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
-   [ ] Verify that `build/tools/base64-image-encoder.html` exists.
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
-   [ ] Configure Cloudflare Pages with build command `vp build` or
    `npm run build` and output directory `build`.
-   [ ] Confirm the deployment settings match the verified local build.
-   [ ] Do not claim deployment is verified until a real deployment
    check has been performed.

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
-   [x] Verify by network inspection that no helper introduces
    non-origin requests (FR-27). *(Evidence: the Playwright
    client-side-encoding test fails on any non-GET request, and the
    offline test runs with the network disabled; build output contains
    no third-party origins.)*

**Exit criteria:** Helpers and patterns exist, are unit-tested, and
are demonstrated by a minimal refactor of the existing Base64 encoder
route (no behavior change required); lazy loading and worker
progress/cancel are demonstrated in the built preview. — **Met.**
Honest caveat: worker *cancel* is unit-tested against a mock worker
(10 cases) and wired to a Cancel button; an interactive cancel of a
large file is not covered by an automated E2E test (timing-dependent),
so it is not claimed as E2E-verified.

### Stage 10 --- PWA/offline implementation and verification [NEW]

This stage implements the §5 verification matrix; the matrix rows are
the exit evidence.

**Status: IN PROGRESS.** The PWA decision record below is done (see
`docs/decisions/ADR-001-pwa-integration.md`); the remaining items are
**not** started and require the heavy-asset work in Phases B–D.

-   [x] Record the PWA integration decision: verify SvelteKit's native
    service-worker support (a `src/service-worker` module plus the
    `$service-worker` module) against a Vite+-compatible plugin under
    the installed versions; document whether the existing hand-written
    `static/sw.js` is kept, replaced, or superseded. Do not assume a
    plugin name (Constitution §3). — **Done:** ADR-001 records the
    evidence (installed kit declares `$service-worker`; no PWA plugin
    present; hand-written `static/sw.js` kept for this increment).
-   [ ] Implement the documented caching strategy: app shell, routes,
    tool catalog/metadata, and per-tool code for offline-supported
    tools.
-   [ ] Self-host every WASM binary and ML model file; confirm no
    runtime third-party origin fetch (FR-28).
-   [ ] Implement the per-tool "make available offline" action: show
    download size before fetching, report success/failure, and handle
    storage-quota exhaustion with a clear recoverable error (FR-29).
-   [ ] Implement cache versioning, update behavior, and recovery from
    interrupted installation.
-   [ ] Add the offline indicator UI state.
-   [ ] Run every row of the §5 matrix that does not depend on
    container-specific behavior (reload offline, tool execution
    offline, asset audit, service-worker update, interrupted cache
    population) and record the results.
-   [ ] For each tool that passes its network-disabled run, set its
    registry `offline` value; downgrade any that fail (FR-30).

**Exit criteria:** Every non-container row of the §5 matrix has a
recorded pass; no tool carries an offline badge without a recorded
verification; the PWA decision note is committed.

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
-   [ ] Run the container-specific §5 rows: Docker startup without
    internet (image already present), Docker restart without internet,
    and --- if that target is approved --- air-gapped first-time
    deployment; record the results.
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
-   [ ] Self-host the selected libraries; no runtime CDN fetch
    (FR-28).
-   [ ] Load each library only via its tool's lazy-loading chunk
    (FR-24); route CPU-heavy tracing/optimisation through the worker
    pattern with progress and cancel (FR-25).
-   [ ] Confirm the Image Converter/Compressor [W] vs. [L] path
    decision (PRD open questions) before implementing the library
    path.
-   [ ] Verify each shipped tool with the network disabled after its
    library is cached; set the registry `offline` value accordingly
    (FR-30).

**Exit criteria:** Each shipped Phase B tool runs offline after its
self-hosted library is cached, with recorded verification, license
entries, and passing tests.

### Stage 14 --- Phase C: ffmpeg-based audio/video tools [NEW]

-   [ ] Record the ffmpeg.wasm decision: exact build and version,
    single-thread vs. multi-thread, resulting COOP/COEP header
    requirement, file-size and memory limits, and the license
    obligations of that exact build (FR-31, Constitution §16/§17).
-   [ ] Self-host the ffmpeg.wasm core assets; include them in the
    per-tool "make available offline" flow with size shown (FR-29).
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
-   [ ] Verify each shipped tool with the network disabled after its
    assets are cached; set the registry `offline` value (FR-30).

**Exit criteria:** The ffmpeg.wasm decision and license obligations
are recorded; each shipped Phase C tool passes its offline
verification with progress/cancel working; unsupported formats
produce explicit errors.

### Stage 15 --- Phase D: ML tools [NEW]

-   [ ] Select the models for Background Remover, Auto Subtitle, and
    any ML Artwork Enhancer scope; record model size and license
    (FR-33, Constitution §17).
-   [ ] Self-host all model weights; no runtime CDN or third-party
    model fetch (FR-28).
-   [ ] Implement each Phase D tool as a separately approved
    increment, with inference in a worker and progress/cancel (FR-25).
-   [ ] Wire models into the per-tool "make available offline" flow
    with size shown; enforce storage-quota handling (FR-29).
-   [ ] Until a model is cached and verified, ship the tool as
    `online-only` or `beta`; only after a network-disabled run with
    the model cached may it claim `full` or `partial` (FR-33, FR-30).
-   [ ] Record each model's size in the credits/licenses listing
    (FR-35).

**Exit criteria:** Each shipped Phase D tool has a recorded
network-disabled verification with its model cached, its registry
status matches reality (no premature `full`), and its model license
and size are documented.

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
| `static/` self-hosted assets | Add self-hosted WASM cores and ML model weights; never reference a CDN (FR-28) |
| PWA/service-worker files | Add per the Stage 10 decision (SvelteKit-native vs. plugin); the existing `static/sw.js` fate is part of that decision |
| `nginx/default.conf` | Mirror COOP/COEP header parity with `_headers` when required; keep SPA fallback |
| Container Dockerfile/compose | Preserve; verify offline startup rows of the §5 matrix (FR-17) |
| Credits/licenses surface | New page or section listing third-party WASM/models/libraries/fonts (FR-35) |
| `tests/unit/` | Add tests for registry schema, search/filters, shared helpers, and each tool's `logic.ts` |
| `tests/e2e/` | Extend smoke tests to sidebar/search/filters and per-tool offline runs |

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

## 5. Offline and Docker verification matrix

| Scenario | Method | Expected result |
|---|---|---|
| First visit with internet | Open local Docker URL in a clean browser | App loads and required PWA assets can be cached |
| Reload while offline | Disable network and reload | App shell and required routes load from local cache |
| Tool execution while offline | Disable network and use each offline-supported tool | Tool completes without required remote requests |
| Local asset audit | Inspect browser network requests and built output | Required assets come from the local origin or cache |
| Docker restart without internet | Stop/start the already-built container with network unavailable | App serves normally |
| Service-worker update | Deploy a new asset/cache version and reopen app | Update completes without mixed-version breakage |
| Interrupted cache population | Simulate failed/partial installation where practical | App fails safely and recovers when resources are available |
| Air-gapped first-time deployment (conditional) | Transfer image/artifacts to a clean offline machine | Image imports and app starts without downloading dependencies |

### Additional matrix rows for Stages 10-11 [NEW]

| Scenario | Method | Expected result |
|---|---|---|
| Per-tool offline verification | Disable network, run one tool end-to-end, record result | Result recorded; registry `offline` value set only on pass (FR-30) |
| "Make available offline" flow | Trigger the per-tool asset download | Size shown before download; success/failure reported (FR-29) |
| Storage-quota exhaustion | Simulate or trigger quota failure during asset download | Clear recoverable error; no broken cache state (FR-29) |
| Self-hosted WASM/model audit | Inspect built output and network panel | All WASM/model bytes from the local origin; no CDN (FR-28) |
| COOP/COEP parity | Compare `static/_headers` with container response headers | Identical cross-origin headers when multi-threading is enabled (FR-31) |
| Insecure-context feature use | Open app over plain-HTTP LAN IP, use mic/screen/clipboard tools | Visible documented error; no silent failure (FR-32) |
| ML tool before model cache | Use an ML tool with model not yet cached | Tool reports state; marked `online-only`/`beta`, not `full` (FR-33) |

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
| ML model weights are large; self-hosting plus caching may exceed typical storage quotas | Offline claim unachievable; quota errors | Record sizes, implement quota handling, ship as `online-only`/`beta` until verified |
| Browser codec/format support varies (MediaRecorder, image encoders, audio decode) | Tool fails on some browsers | Per-tool fallbacks and explicit error states (FR-34); define a browser baseline |
| Service-worker cache serves stale tool code after updates | Broken tool versions | Versioned caches; tested update flow (Stage 10) |
| Third-party WASM/ML/library licenses incompatible with the project's distribution | Legal risk; rework | Verify licenses before adoption; credits/licenses requirement (FR-35) |
| Registering unapproved tools from the catalog by accident | Scope creep | Registry only accepts approved tools; per-tool approval gate (FR-37) |

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
    "works offline" filter pass unit tests and manual checks (Stages
    8-9).
-   [ ] [NEW] Shared helpers (file input/drop, download, ZIP export,
    capability detection) exist with tests, and tools use them.
-   [ ] [NEW] CPU-heavy tools run in workers with demonstrated
    progress and cancel (Stage 9).
-   [ ] [NEW] The PWA integration decision (SvelteKit-native vs.
    Vite+-compatible plugin) is recorded with evidence; no plugin name
    was assumed (Stage 10).
-   [ ] [NEW] Every row of the §5 matrix --- original and added ---
    has a recorded pass, a recorded failure, or a documented blocker;
    no offline claim exists without a recorded network-disabled run
    (Stages 10-11).
-   [ ] [NEW] All WASM binaries and ML models are self-hosted with no
    runtime third-party origin requests (FR-28).
-   [ ] [NEW] Per-tool "make available offline" shows size and handles
    quota exhaustion with a clear error (FR-29).
-   [ ] [NEW] Supported secure-context access patterns are documented
    and insecure origins fail visibly (FR-32).
-   [ ] [NEW] ffmpeg.wasm build, threading mode, limits, and license
    obligations are recorded; header parity is verified if
    multi-threading is enabled (FR-31).
-   [ ] [NEW] ML tools are `online-only`/`beta` until their model
    cache is verified offline (FR-33).
-   [ ] [NEW] The credits/licenses listing exists and covers all
    third-party assets (FR-35).
-   [ ] [NEW] Each shipped tool follows the `Tool.svelte`/`logic.ts`/
    `meta.ts` contract, is in the PRD §12 catalog, and was separately
    approved (FR-36, FR-37).
-   [ ] [NEW] No out-of-scope feature (other categories, featured
    section, favorites/recents, tool-to-tool hand-off, CLI, accounts,
    analytics) was built.

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
