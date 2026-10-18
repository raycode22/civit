# Civit --- Product Requirements Document

**Document type:** Product requirements\
**Status:** Initial draft based only on the supplied scaffold\
**Product name:** Civit

## 1. Product overview

Civit is a web application scaffold for a collection of
browser-accessible tools. The supplied implementation outline includes a
shared application shell, search, theme controls, reusable tool cards
and status badges, a file drop zone, and a [REVISED] Base64 image
encoder (a single-purpose tool that reads an image the user provides
entirely in the browser and outputs its Base64 data-URL text, with no
upload).
The application is intended to produce a static build suitable for
deployment to Cloudflare Pages.

The source focuses primarily on the technical scaffold and toolchain.
Product-market goals, user personas, detailed UX flows, and success
metrics are not specified.

## 2. Goals

### In scope

-   Provide a SvelteKit application structure for a collection of tools.
-   Provide a tool registry and shared tool metadata/types.
-   Provide shared UI components for tool cards, status, theme
    switching, and file dropping.
-   Include search infrastructure.
-   Include a Base64 image encoder as the initial tool slice.
-   Support static generation/deployment through SvelteKit's static
    adapter.
-   Provide unit and end-to-end smoke-test foundations.
-   Use Vite+ as the unified CLI for development, build, testing,
    linting, formatting, and checking, subject to version validation.
-   [NEW] Ship PWA/offline behavior as a required feature (FR-13 to
    FR-20): manifest, service worker, caching strategy, per-tool
    offline availability, and an offline indicator.
-   [NEW] Cover three tool categories with a 44-tool catalog: Images &
    Assets (17), Audio & Video (16), and Typography & Text (11). See
    §12.
-   [NEW] Provide discovery infrastructure: a sidebar grouped by
    category, Fuse.js search over name/description/keywords, a
    category filter, a "works offline" filter, and status/offline
    badges.
-   [NEW] Provide shared tool infrastructure: per-tool lazy loading of
    the tool and its heavy libraries, Web Workers for CPU-heavy work
    with progress and cancel, and shared helpers for file input/drop,
    download, ZIP export of multi-file output, and browser-capability
    detection with clear error messages.
-   [NEW] Process everything locally in the browser: no uploads and no
    telemetry (see Constitution §13).
-   [NEW] Self-host all WASM binaries and ML model files; offer
    per-tool "make available offline" downloads that show size, with
    storage-quota handling, instead of precaching everything.
-   [NEW] Deliver tools in phases A (lightweight), B (library-based
    image/font), C (ffmpeg-based audio/video), and D (ML), with every
    tool remaining a separately approved increment.
-   [NEW] Publish a credits/licenses listing for all third-party WASM
    builds, ML models, libraries, and fonts.

### Out of scope unless separately approved

-   [REVISED] ~~Adding a PWA plugin or offline/PWA behavior.~~
    Selecting a *specific* PWA plugin name before the
    SvelteKit-native-service-worker vs. Vite+-compatible-plugin
    decision is verified and recorded (Constitution §3).
-   Tool categories other than Images & Assets, Audio & Video, and
    Typography & Text [NEW].
-   A featured tools section on the landing page [NEW].
-   Favorites and recents [NEW].
-   Tool-to-tool hand-off (passing one tool's output into another
    tool's input) [NEW].
-   A CLI [NEW].
-   Accounts, authentication, or any server-side user state [NEW].
-   Analytics and telemetry [NEW] (analytics remains out of scope as
    before; telemetry is prohibited outright by Constitution §13).
-   Implementing additional tool vertical slices.
-   Server-side APIs, databases, authentication, or user accounts.
-   Cloud services beyond the stated static deployment target.
-   Analytics, telemetry, monetization, and product-level privacy
    policy.
-   Specific accessibility or performance budgets not stated in the
    source.

## 3. Target users and use cases

The supplied source does not define user personas. The following are
functional use cases implied by the scaffold, not validated user
research:

1.  A visitor can navigate the Civit landing page and discover available
    tools.
2.  A visitor can search the tool collection.
3.  A visitor can open a tool's dedicated route.
4.  A visitor can use the Base64 image encoder tool interface.
5.  A visitor can switch the application's theme.
6.  A developer can run checks and tests, build the static site, preview
    the output, and deploy it.

## 4. Functional requirements

  ----------------------------------------------------------------------------------------
  ID                      Requirement                        Evidence/status
  ----------------------- ---------------------------------- -----------------------------
  FR-01                   The application shall provide a    Route file is specified;
                          landing route at `/`.              detailed UI behavior is not
                                                             defined.

  FR-02                   The application shall provide tool Dynamic route structure is
                          detail routes using `/tools/[id]`. specified.

  FR-03                   The application shall maintain a   `src/lib/tools/registry.ts`
                          shared tool registry and shared    and `types.ts` are specified.
                          tool types.                        

  FR-04                   The application shall include a    Explicitly specified in the
                          `base64-image-encoder` tool with   file tree.
                          separate UI, logic, and metadata   
                          files.                             

  FR-05                   The application shall provide      Explicitly specified in the
                          shared tool-card, status-badge,    file tree.
                          theme-toggle, and file-drop-zone   
                          components.                        

  FR-06                   The application shall provide      Explicitly specified; search
                          search logic under                 behavior/ranking is not
                          `src/lib/search/search.ts`.        defined.

  FR-07                   The application shall provide      Explicitly specified; theme
                          theme initialization via           persistence details are not
                          `static/theme-init.js` and theme   defined.
                          state via                          
                          `src/lib/theme/theme.svelte.ts`.   

  FR-08                   The application shall support      Explicitly specified.
                          static output using                
                          `@sveltejs/adapter-static`.        

  FR-09                   The application shall expose       Scripts and `vp` command
                          development, build, preview,       mapping are specified.
                          check, unit-test, E2E-test, and    
                          sync commands.                     

  FR-10                   The application shall include      `tests/unit/base64.test.ts`
                          unit-test and Playwright E2E       and `tests/e2e/smoke.spec.ts`
                          smoke-test foundations.            are specified.

  FR-11                   The static output shall include    Minimum output checks are
                          the expected routes and static     listed in the source.
                          assets.                            

  FR-12                   The application shall be           Deployment target and output
                          deployable to Cloudflare Pages     directory are specified.
                          with output directory `build`.     
  ----------------------------------------------------------------------------------------

### Additional offline/PWA/local-deployment requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-13 | The application shall provide PWA metadata and installability support. | Manifest and required installability metadata are served locally and validated in a supported browser. |
| FR-14 | The application shall register a service worker with a documented caching strategy. | Service worker installs, caches required resources, updates safely, and handles interrupted installation. |
| FR-15 | The app shell, required routes, tool catalog/metadata, and code for offline-supported tools shall be available without internet after setup/cache population. | Browser tests pass with external network access disabled. |
| FR-16 | Core supported tool workflows shall not depend on external APIs, CDNs, remote fonts, or runtime library downloads. | Network inspection and offline tests show no required remote requests. |
| FR-17 | The project shall provide a reproducible Docker-based local deployment. | Documented Docker build/start workflow succeeds on a clean supported machine with the required image/dependencies available. |
| FR-18 | The app shall communicate offline state and provide predictable behavior when a requested capability is unavailable offline. | UI and tests cover offline/online transitions and failed network requests. |
| FR-19 | Local data that is required to persist shall use a documented persistence mechanism. | Reload and container/browser restart tests match the documented retention policy. |
| FR-20 | If air-gapped first-time deployment is a supported target, the project shall provide an image/dependency transfer procedure. | A clean machine with no internet can load the transferred image and run the application. This criterion is conditional on that target being approved. |

### Tool catalog, discovery, and local-processing requirements [NEW]

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-21 | Every registry entry shall carry: `category` (`images-assets` \| `audio-video` \| `typography-text`), `icon`, `description`, `status` (`new` \| `beta` \| `stable`), `offline` (`full` \| `partial` \| `online-only`), `requires` (subset of `wasm` \| `ml-model` \| `camera-mic-screen` \| `clipboard`), and search keywords. | Registry type check passes; every catalogued tool in §12 has all fields populated. |
| FR-22 | The tool listing shall be grouped by category in a sidebar, with status and offline badges shown per tool. | Visual/manual check of the built site; badge values come only from registry fields. |
| FR-23 | Search shall use Fuse.js over tool name, description, and keywords, and shall compose with a category filter and a "works offline" filter. | Unit tests for search/filter logic; manual check in the built site. |
| FR-24 | Each tool and its heavy libraries shall be lazy-loaded so that opening one tool does not load another tool's code. | Network panel inspection: tool chunk loads on navigation to that tool only. |
| FR-25 | CPU-heavy processing shall run in a Web Worker and expose progress reporting and cancellation. | At least one worker-based tool demonstrates progress updates and a working cancel action. |
| FR-26 | Shared helpers shall cover: file input/drop, download, ZIP export for multi-file output, and browser-capability detection that fails with clear error messages when a required API is missing. | Unit tests for helpers; an error-state screenshot or manual check for a missing capability. |
| FR-27 | All processing shall be local: no user file, selection, recording, or derived output may be uploaded, and no telemetry may be emitted. | Network inspection during representative tool workflows shows no non-origin requests. |
| FR-28 | All WASM binaries and ML model files shall be self-hosted; no runtime CDN or third-party origin fetch. | Built output contains the assets; network panel shows no third-party hosts. |
| FR-29 | Tools with heavy assets shall offer a per-tool "make available offline" action that shows the download size before fetching, and shall handle storage-quota exhaustion with a clear, recoverable error. | Manual check of size display; quota-error path exercised in a test or documented simulation. |
| FR-30 | No tool may be labelled `full` or `partial` offline until its execution path has been verified with the browser network disabled. | Per-tool verification record for every tool carrying an offline badge. |
| FR-31 | ffmpeg-based tools shall use a self-hosted ffmpeg.wasm core; the single-thread vs. multi-thread choice shall be recorded; COOP/COEP headers shall be served from `static/_headers` and from the Docker/Podman web server when multi-threading is used; file-size/memory limits and the license obligations of the exact build shall be documented. | Header check on built output and container response; recorded decision note; license entry in the credits list. |
| FR-32 | The app shall document supported access patterns for secure-context features (microphone, screen capture, clipboard, service worker require HTTPS or localhost), including the known breakage when a Docker/Podman deployment is reached over plain HTTP on a LAN IP. | Documentation plus a manual check that an insecure context shows a clear error instead of silent failure. |
| FR-33 | ML tools shall record model size, self-host the weights, and only be marked offline-capable after the model is cached; until then they shall be `online-only` or `beta`. | Model size recorded; offline test passes only after the model-cache step; registry status matches. |
| FR-34 | Where browser codec/format support varies, each affected tool shall define fallbacks and explicit error states. | Documented format matrix per tool; error state shown for an unsupported input. |
| FR-35 | The app shall publish a credits/licenses listing covering third-party WASM builds, ML models, JS libraries, and fonts. | Page or section exists in the built site and lists each dependency with its license. |
| FR-36 | Every tool shall follow the tool contract: `src/lib/tools/<tool-id>/` containing `Tool.svelte`, `logic.ts`, and `meta.ts`, with logic unit-tested where practical. | Directory structure matches; unit tests exist for `logic.ts` of each shipped tool. |
| FR-37 | Every catalogued tool shall be assigned to a phase (A, B, C, or D) and remain a separately approved increment; nothing in this PRD auto-approves any individual tool. | Phase assignment recorded in the §12 catalog; approvals tracked per tool. |
| FR-38 | User-facing copy, tool names, and documentation shall use British English spelling (e.g. "Normaliser", "Optimiser"). | Review pass over UI strings and docs; catalog names follow the convention. |

## 5. Non-functional requirements

### Architecture and maintainability

-   Use SvelteKit for routing and static adapter integration.
-   Use Vite+ for the Vite-layer toolchain without replacing SvelteKit
    responsibilities.
-   Keep tool logic, metadata, and UI modular.
-   Keep shared infrastructure under `src/lib/`.
-   Preserve strict TypeScript compiler settings from the scaffold.

### Build and deployment

-   Produce a static site in `build/`.
-   Verify the presence of `build/index.html`,
    `build/tools/base64-image-encoder.html`, `build/_headers`, and
    `build/theme-init.js`.
-   Preserve the static headers file and other specified assets.

### Quality

-   Support linting, formatting, type checking, unit tests, and browser
    smoke tests.
-   Keep `svelte-check` until Svelte-specific type coverage has been
    verified.
-   Document failures and compatibility caveats rather than treating
    unverified commands as reliable.

### Runtime and reproducibility

-   Use the Node.js version defined by repository CI when available.
-   Pin the verified Vite+ version.
-   Preserve `.npmrc` settings for strict engine checks and exact
    dependency saves.

The source does not establish numerical performance, accessibility,
browser support, or availability targets.

## 6. Proposed information architecture

-   `/` --- landing page/tool directory
-   `/tools/[id]` --- individual tool route
-   Shared layout --- global shell and theme behavior
-   Shared library --- components, search, theme, tool types, and
    registry
-   Static assets --- headers, favicon, robots rules, theme
    initialization
-   Tests --- unit and E2E smoke tests

## 7. Acceptance criteria

1.  Dependencies install using the documented, repository-approved Vite+
    workflow.
2.  `vp check` completes successfully, or each remaining incompatibility
    is documented and tracked.
3.  `vp test run` completes successfully.
4.  `vp build` completes successfully using SvelteKit's static adapter.
5.  The required output files exist in `build/`.
6.  `vp preview` serves the generated site locally.
7.  Playwright smoke tests pass in an environment with Chromium
    installed.
8.  The landing page and Base64 image encoder route can be opened from
    the built preview.
9.  The toolchain migration does not unnecessarily alter application
    files.
10. Cloudflare Pages configuration uses `vp build` (or `npm run build`
    delegating to it) and `build` as the output directory.
11. [NEW] Every registry entry validates against the FR-21 field set,
    and every tool in the §12 catalog has all fields populated.
12. [NEW] The sidebar groups tools by category; the category and "works
    offline" filters and Fuse.js search compose correctly (FR-22,
    FR-23).
13. [NEW] Network inspection confirms per-tool lazy loading (FR-24) and
    that no non-origin request occurs during tool workflows (FR-27).
14. [NEW] At least one worker-based tool demonstrates progress and
    cancel (FR-25); shared helpers produce clear errors for missing
    capabilities (FR-26).
15. [NEW] No tool displays an offline badge without a recorded
    network-disabled verification (FR-30).
16. [NEW] ffmpeg.wasm decisions (threading, limits, license) are
    recorded and COOP/COEP headers are present on both the static build
    and the container response where required (FR-31).
17. [NEW] Secure-context access patterns are documented and an insecure
    context produces a clear error (FR-32).
18. [NEW] The credits/licenses listing exists and covers all
    third-party assets (FR-35).
19. [NEW] Every shipped tool follows the FR-36 tool contract and is in
    the §12 catalog with a phase assignment (FR-36, FR-37).

## 8. Risks and open questions

-   **Vite+ release compatibility:** The source describes evolving
    `check`, `lint`, and `fmt` configuration; actual schema must be
    verified.
-   **Formatter configuration:** Confirm that the Oxfmt options in the
    proposed config are accepted.
-   **Svelte-specific linting:** Oxlint may not cover `.svelte` files;
    decide whether to retain a separate Svelte lint command.
-   **Type checking:** Confirm whether `vp check` plus `svelte-check`
    gives the intended coverage and ordering.
-   **Rolldown/static adapter:** Validate that the produced output is
    accepted by `adapter-static`.
-   **Preview command:** Verify the intended flags and Playwright
    orchestration.
-   **Node version:** Use CI configuration if present; the source does
    not define a definitive version.
-   **Product behavior:** Search ranking, supported input types, encoder
    output behavior, errors, file-size limits, and accessibility
    behavior are not specified in the source.
-   **Product metrics:** No adoption, performance, or reliability
    metrics are provided.
-   [NEW] **Atlas tools:** The purpose of Image Atlas, Audio Atlas, and
    Video Atlas is unconfirmed in the source. Proposed Civit
    equivalents are per-media-type format reference pages (e.g. an
    image-format support matrix); this needs a decision before those
    three tools are approved. They are provisionally tagged [L] and
    Phase A on that assumption only.
-   [NEW] **All one-line tool purposes are inferred from tool names
    only** and are assumptions to be confirmed per tool before its
    increment is approved. The inferred purposes are recorded in the
    §12 catalog's Notes column.
-   [NEW] **Artwork Enhancer scope undefined:** non-ML
    sharpen/upscale ([L], Phase A) vs. ML-based enhancement ([M],
    Phase D). Decide before implementation.
-   [NEW] **Image Converter format matrix undefined:** which input and
    output formats are in scope for the [L] Canvas path vs. the [W]
    library path.
-   [NEW] **Document Converter formats undefined:** which document
    formats are in scope; tag and phase cannot be finalised until
    formats are chosen.
-   [NEW] **Text Editor scope undefined:** keep minimal (plain-text
    editing helpers?) or fold into other text tools; decide scope
    before Phase A.
-   [NEW] **ffmpeg.wasm exact build:** which build, single-thread vs.
    multi-thread, resulting COOP/COEP header requirements, file-size
    and memory limits, and license obligations.
-   [NEW] **ML model selection and size:** models for Background
    Remover, Auto Subtitle, and any ML Artwork Enhancer; total
    self-hosted weight sizes and storage-quota implications.
-   [NEW] **Codec variance baseline:** minimum supported browser set
    and fallback strategy for MediaRecorder/ffmpeg-dependent formats.
-   [NEW] **Device-permission tools ([D]):** Paste Image, Screen
    Recorder, and Voice Recorder assume clipboard/getDisplayMedia/
    getUserMedia; confirm target browsers and behaviour under an
    insecure context (FR-32).
-   [NEW] **Offline status for [W]/[M] tools:** "offline" for these
    means after a per-tool asset download; confirm whether `full` or
    `partial` is the right label for that state.
-   [NEW] **Build-invariant mismatch (pre-existing, surfaced during
    Stage 8/9 execution):** Constitution §8 and Tech Plan Stage 5 list
    `build/tools/base64-image-encoder.html` as a required output, but
    the tool route `src/routes/tools/[id]/+page.ts` sets
    `prerender = false` (deliberately, for the SPA fallback), so that
    file is never emitted by `adapter-static`. The route is served via
    the `index.html` fallback. Decision needed: either (a) prerender
    known tool routes (requires enumerating tool ids at build time via
    SvelteKit `entries`) and keep the invariant, or (b) relax the
    invariant to "the tool route loads from the built preview/SPA
    fallback." No action taken yet; not a regression from this work.

## 9. Offline acceptance criteria

1. Start Civit using the documented Docker workflow.
2. Load the app once so the PWA can install and required caches can be populated.
3. Disable internet access and confirm that the app can reopen, navigate to the landing page and tool routes, and execute each tool designated as offline-supported.
4. Confirm required JavaScript, CSS, fonts, icons, images, metadata, and libraries are not fetched from third-party hosts at runtime.
5. Confirm reload and offline-to-online transitions do not break the app.
6. Confirm a service-worker/cache update can be completed without leaving the app unusable.
7. Confirm required local data survives the restarts specified by the persistence policy.
8. Test Docker startup without internet when the container image is already present locally.
9. If air-gapped initial installation is in scope, verify the transferred image and any required artifacts on a clean offline machine.
10. [NEW] Verify the per-tool "make available offline" flow: size is shown before download, the download completes, and the tool then runs with the network disabled.
11. [NEW] Exercise storage-quota exhaustion during a heavy-asset download (real or simulated) and confirm a clear, recoverable error.
12. [NEW] Verify each tool's offline badge against a recorded network-disabled run; downgrade the registry value if the run fails.
13. [NEW] For Docker/Podman over plain HTTP on a LAN IP, confirm that secure-context features (mic, screen capture, clipboard, service worker) fail with a documented, visible error rather than silently.
14. [NEW] Confirm that COOP/COEP headers are actually served by the container (required for multi-threaded ffmpeg.wasm); if the single-thread build is used instead, record that decision and confirm the app still passes the matrix.

## 10. Dependencies

-   SvelteKit and its static adapter
-   Svelte and `@sveltejs/vite-plugin-svelte`
-   Vite+ (`vite-plus`)
-   Tailwind CSS and its Vite plugin
-   TypeScript and `svelte-check`
-   DaisyUI
-   Fuse.js
-   lucide-svelte
-   Playwright for E2E tests
-   [NEW] ffmpeg.wasm (self-hosted core; exact build, threading mode,
    and license obligations to be verified before Phase C)
-   [NEW] Self-hosted ML runtime/model weights for Phase D tools
    (exact choices open; sizes must be recorded)
-   [NEW] A Web Worker harness pattern for CPU-heavy tools (no
    specific library assumed)
-   [NEW] A browser-capability detection helper (no specific library
    assumed)

The exact dependency versions in the source are scaffold examples and
must be resolved and verified as a compatible set before implementation.

## 11. Source boundary

This PRD preserves what the supplied scaffold establishes. Where it does
not define user-visible behavior or product policy, this document marks
the point as unspecified rather than inventing a requirement.

## 12. Tool catalog --- three categories, 44 tools [NEW]

Tags: [L] lightweight (Canvas/Web APIs/pure JS); [W] needs a WASM/JS
library; [M] needs an ML model; [D] needs a device/permission API.
Phases: A = [L] tools; B = library-based [W] image/font tools;
C = ffmpeg-based audio/video tools; D = [M] ML tools. Every tool
remains a separately approved increment (FR-37).

All "Offline (target)" values below are targets, not verified claims.
No tool may display an offline badge until its network-disabled
verification passes (FR-30). All "Notes" purposes are inferred from
tool names only and must be confirmed before that tool's increment is
approved.

### Images & Assets (17)

| # | Tool | Tag | Phase | Offline (target) | Status | Notes (inferred purpose --- assumption) |
|---|---|---|---|---|---|---|
| 1 | Image Atlas | TBD | A (provisional) | full | new | Purpose unconfirmed in source. Proposed equivalent: a per-media-type image format reference page. Needs decision. |
| 2 | Artwork Enhancer | [L] or [M] | A or D (provisional) | full or partial | new | Scope undefined: non-ML sharpen/upscale ([L], A) vs. ML enhancement ([M], D). Needs decision. |
| 3 | Background Remover | [M] | D | partial (after model download) | new | Remove image backgrounds via an ML segmentation model. |
| 4 | Base64 Image Encoder | [L] | A | full | new | Encode an image as a Base64 data URL. Already exists as the scaffold tool. |
| 5 | Favicon Generator | [L] | A | full | new | Generate favicon set/sizes from a source image. |
| 6 | Image Clipper | [L] | A | full | new | Crop an image to a selection. |
| 7 | Image Compressor | [L]/[W] | A (Canvas path) or B (library path) | full | new | Reduce image file size with quality controls. |
| 8 | Image Converter | [L]/[W] | A (Canvas path) or B (library path) | full | new | Convert between image formats. Format matrix undefined. |
| 9 | Image De-skew | [L] | A | full | new | Straighten a rotated/skewed scanned image. |
| 10 | Image Masker | [L] | A | full | new | Apply a mask/redaction region to an image. |
| 11 | Image Splitter | [L] | A | full | new | Split an image into a grid of tiles (multi-file ZIP export). |
| 12 | Image Stitcher | [L] | A | full | new | Combine multiple images into one (horizontally/vertically/grid). |
| 13 | Image Tracer | [W] | B | full (after library download) | new | Vectorise a raster image to SVG. |
| 14 | Metadata Stripper | [L] | A | full | new | Remove EXIF/metadata from images. |
| 15 | Paste Image | [D] | A (provisional) | full | new | Accept an image from the clipboard. Secure context required. |
| 16 | Placeholder Generator | [L] | A | full | new | Generate placeholder images (size/format-driven). |
| 17 | SVG Optimiser | [W] | B | full (after library download) | new | Optimise/minify SVG markup. |

### Audio & Video (16)

| # | Tool | Tag | Phase | Offline (target) | Status | Notes (inferred purpose --- assumption) |
|---|---|---|---|---|---|---|
| 1 | Audio Atlas | TBD | A (provisional) | full | new | Purpose unconfirmed in source. Proposed equivalent: a per-media-type audio format reference page. Needs decision. |
| 2 | Video Atlas | TBD | A (provisional) | full | new | Purpose unconfirmed in source. Proposed equivalent: a per-media-type video format reference page. Needs decision. |
| 3 | Audio Extractor | [W] | C | full (after library download) | new | Extract the audio track from a video file. |
| 4 | Audio Normaliser | [W] | C | full (after library download) | new | Normalise audio loudness. |
| 5 | Audio Trimmer | [L]/[W] | C | full (after library download) | new | Cut an audio clip to a time range. |
| 6 | Auto Subtitle | [M] | D | partial (after model download) | new | Generate subtitles from speech via speech-to-text. |
| 7 | Frame Extractor | [L]/[W] | C | full (after library download) | new | Extract still frames from a video. |
| 8 | Screen Recorder | [D] | A (provisional) | full | new | Record the screen (and optionally audio) via getDisplayMedia. Secure context required. |
| 9 | Subtitle Converter | [L] | A | full | new | Convert subtitle files between formats (e.g. SRT/VTT). |
| 10 | Subtitle Studio | [L] | A | full | new | Edit/create subtitle files with timing. |
| 11 | Timecode Calculator | [L] | A | full | new | Compute and convert timecodes/frame rates. |
| 12 | Video Muter | [W] | C | full (after library download) | new | Remove or mute a video's audio track. |
| 13 | Video to GIF | [W] | C | full (after library download) | new | Convert a video segment into an animated GIF. |
| 14 | Video Trimmer | [W] | C | full (after library download) | new | Cut a video clip to a time range. |
| 15 | Voice Recorder | [D] | A (provisional) | full | new | Record audio from the microphone. Secure context required. |
| 16 | Waveform Generator | [L]/[W] | A (Web Audio path) or C (library path) | full | new | Render a waveform image from audio. |

### Typography & Text (11)

| # | Tool | Tag | Phase | Offline (target) | Status | Notes (inferred purpose --- assumption) |
|---|---|---|---|---|---|---|
| 1 | Document Converter | TBD | A (provisional) | full | new | Convert between text-based document formats. Formats undefined; tag/phase provisional. |
| 2 | Font File Explorer | [L]/[W] | B | full (after library download) | new | Inspect the metadata/tables of a font file. |
| 3 | Glyph Browser | [L] | A | full | new | Browse a font's glyphs/characters. |
| 4 | Large Type | [L] | A | full | new | Display text very large (e.g. signage/visibility aid). |
| 5 | Line Height Calculator | [L] | A | full | new | Compute line-height values from font size/ratio. |
| 6 | Paper Sizes | [L] | A | full | new | Reference paper sizes and their dimensions. |
| 7 | PX to REM | [L] | A | full | new | Convert px values to rem (and related units). |
| 8 | Text Diff | [L] | A | full | new | Compare two texts and highlight differences. |
| 9 | Text Editor | TBD | A (provisional) | full | new | Minimal plain-text editing. Scope undefined; keep minimal. |
| 10 | Typography Calculator | [L] | A | full | new | Compute typographic scales/values. |
| 11 | Word Counter | [L] | A | full | new | Count words/characters/lines in text. |

### Phase assignment summary [NEW]

| Phase | Scope | Count |
|---|---|---|
| A | All [L] tools, plus provisional placements ([D] tools that need only browser permission APIs, unconfirmed Atlas/Document/Text-Editor entries) | 27 (includes 5 provisional) |
| B | Library-based [W] image/font tools: Image Tracer, SVG Optimiser, Font File Explorer, plus the [W] variants of Image Compressor/Converter if chosen | 3 + up to 2 |
| C | ffmpeg-based audio/video tools: Audio Extractor, Audio Normaliser, Audio Trimmer, Frame Extractor, Video Muter, Video to GIF, Video Trimmer, plus the [W] variant of Waveform Generator if chosen | 7 + up to 1 |
| D | ML tools: Background Remover, Auto Subtitle, plus Artwork Enhancer if ML scope is approved | 2 + up to 1 |

Provisional placements must be confirmed (see §8 Open questions)
before those tools' increments are approved. [D] tools (Paste Image,
Screen Recorder, Voice Recorder) are placed in Phase A because they
need only browser permission APIs and no WASM/ML asset; if a recording
tool later needs an ffmpeg-based encode step, it moves to Phase C.
