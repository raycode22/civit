# Civit --- Multi-Tool Web App: Product Requirements Document

**Document type:** Product requirements\
**Status:** Revised for online Cloudflare Pages + R2 and a separate Docker/offline delivery target.\
**Product name:** Civit

## 1. Product overview

Civit is a multi-purpose browser application containing tools for Images & Assets, Audio & Video, and Typography & Text. The shared shell provides tool discovery, search, theme controls, reusable tool cards/status badges, and file handling. The Base64 image encoder is the reference tool, not the product's sole purpose; it reads an image and creates a Base64 data URL entirely in the browser.

Civit has two independent delivery profiles built from the same application source:

- **Online web version (immediate deployment target):** a static SvelteKit build hosted on Cloudflare Pages. Ordinary npm dependencies are installed and bundled at build time. Large runtime files are served from the existing Cloudflare R2 setup; approved CDNs may be used where useful. The online deployment is expected to have internet access.
- **Docker/offline version (separate deployment target):** a distinct build profile containing all approved runtime libraries and assets required by shipped tools. Once the image is built/imported and started, the app and every released tool must work without external network access.

Both profiles process user content locally. No user file, selection, recording, or generated output is uploaded; no analytics or telemetry is emitted. The online profile may request approved public code/assets, which is different from sending user content to those services.

## 2. Goals

### In scope

-   Provide a SvelteKit application structure for a collection of tools.
-   Provide a tool registry and shared tool metadata/types.
-   Provide shared UI components for tool cards, status, theme
    switching, and file dropping.
-   Include search infrastructure.
-   Include a Base64 image encoder as the initial reference tool slice
    that proves the multi-tool architecture.
-   Publish the online static application through Cloudflare Pages using SvelteKit's static adapter and `build/` output.
-   Use the existing Cloudflare R2 bucket as the online origin for large runtime assets that do not fit Pages' per-file limit.
-   Permit approved runtime CDN/R2 asset delivery in the online profile while keeping all user-file processing client-side.
-   Maintain a separate Docker build profile that bundles all approved required runtime assets and works with external networking disabled.
-   Provide unit and end-to-end smoke-test foundations for shared behavior and separate acceptance checks for the online and Docker profiles.
-   Use Vite+ as the unified CLI for development, build, testing, linting, formatting, and checking, subject to version validation.
-   Support PWA metadata/service-worker enhancements where they remain useful, but do not make full browser-offline operation a prerequisite for online deployment.
-   [NEW] Cover three tool categories with a 44-tool catalog: Images &
    Assets (17), Audio & Video (16), and Typography & Text (11). See
    §12.
-   [NEW] Provide discovery infrastructure: a sidebar grouped by
    category, Fuse.js search over name/description/keywords, a
    category filter, a Docker/offline-capability filter, and status and
    capability badges. Do not imply that the online deployment works
    offline simply because a tool is packaged for Docker.
-   [NEW] Provide shared tool infrastructure: per-tool lazy loading of
    the tool and its heavy libraries, Web Workers for CPU-heavy work
    with progress and cancel, and shared helpers for file input/drop,
    download, ZIP export of multi-file output, and browser-capability
    detection with clear error messages.
-   [NEW] Process everything locally in the browser: no uploads and no
    telemetry (see Constitution §13).
-   [REVISED] Deliver assets by profile: the online profile may load approved large WASM/model assets from R2 or an approved CDN; the Docker/offline profile packages the exact required files into the image. Browser-PWA offline asset downloads are optional and must not block the online release. Heavy model/FFmpeg assets require explicit owner approval before inclusion in the Docker package.
-   [NEW] Deliver tools in phases A (lightweight), B (library-based
    image/font), C (ffmpeg-based audio/video), and D (ML), with every
    tool remaining a separately approved increment.
-   [NEW] Publish a credits/licenses listing for all third-party WASM
    builds, ML models, libraries, and fonts.

### Out of scope unless separately approved

-   Adding or changing a PWA integration before verifying SvelteKit's
    native service-worker support against a Vite+-compatible option.
    Browser-wide offline caching is optional and is not a release gate
    for the online Pages deployment (Constitution §3).
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
-   Server-side APIs, databases, authentication, accounts, backend compute,
    and server-side file processing. Cloudflare Pages and the already-selected
    R2 bucket are approved only for static application and public asset delivery.
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
4.  A visitor can use the online application with internet access; a separate Docker deployment can run the released tools without external network access.
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
                          `base64-image-encoder` reference   file tree.
                          tool with separate UI, logic, and  
                          metadata files, as the first of    
                          many tools.                        

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

### Deployment-profile requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-13 | The online web app may provide PWA metadata/installability. Installability does not imply full offline capability. | Manifest and installability behavior are checked in a supported browser; user-facing claims accurately state actual capability. |
| FR-14 | If a service worker is used, its online caching/update behavior must be documented and recoverable. It is not the source of the Docker offline guarantee. | Service-worker updates do not corrupt the online site; cache failures recover without breaking normal online use. |
| FR-15 | The Docker/offline profile shall package the app shell, prerendered routes, required tool code and all required runtime assets. Browser caching is optional and separate. | Docker asset inventory and network-disabled tests show every released tool works from the image. |
| FR-16 | The online profile may load application assets from Pages, the configured R2 custom domain and approved CDNs. The Docker profile must not require external runtime asset requests. | Online network trace matches its origin allowlist; Docker network-disabled tests make no external runtime requests. |
| FR-17 | Provide a reproducible Docker-based local deployment. | Documented Docker build/start succeeds; final image contains all required runtime files. |
| FR-18 | Report connection state without misleading users about offline availability. | UI shows connection state and does not mark uncached/remote-dependent tools as ready offline. |
| FR-19 | Document persistence for local data where applicable. | Reload and restart tests match the defined persistence behavior. |
| FR-20 | Air-gapped Docker deployment is supported by exporting/importing the completed image, including base-image layers. | `docker save`/`docker load` is demonstrated on a machine with no internet; image starts successfully. |

### Tool catalog, discovery, and local-processing requirements [NEW]

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-21 | Every registry entry shall carry: `category` (`images-assets` \| `audio-video` \| `typography-text`), `icon`, `description`, `status` (`new` \| `beta` \| `stable`), `offline` (`full` \| `partial` \| `online-only`), `requires` (subset of `wasm` \| `ml-model` \| `camera-mic-screen` \| `clipboard`), and search keywords. | Registry type check passes; every catalogued tool in §12 has all fields populated. |
| FR-22 | The tool listing shall be grouped by category in a sidebar, with status and offline badges shown per tool. | Visual/manual check of the built site; badge values come only from registry fields. |
| FR-23 | Search shall use Fuse.js over tool name, description, and keywords, and shall compose with a category filter and a "works offline" filter. | Unit tests for search/filter logic; manual check in the built site. |
| FR-24 | Each tool and its heavy libraries shall be lazy-loaded so that opening one tool does not load another tool's code. | Network panel inspection: tool chunk loads on navigation to that tool only. |
| FR-25 | CPU-heavy processing shall run in a Web Worker and expose progress reporting and cancellation. | At least one worker-based tool demonstrates progress updates and a working cancel action. |
| FR-26 | Shared helpers shall cover: file input/drop, download, ZIP export for multi-file output, and browser-capability detection that fails with clear error messages when a required API is missing. | Unit tests for helpers; an error-state screenshot or manual check for a missing capability. |
| FR-27 | All processing shall be local: no user file, selection, recording, or derived output may be uploaded, and no telemetry may be emitted. Asset requests to configured delivery origins are allowed in the online profile. | Network inspection confirms no uploads/telemetry; online requests match the origin allowlist and Docker runtime makes no external requests. |
| FR-28 | WASM/model delivery is profile-specific: online assets may come from R2 or approved CDN origins; required Docker assets must be included in the image and served locally. | Online delivery URLs, CORS and caching are verified; Docker build audit confirms required assets are local. |
| FR-29 | Heavy assets required by released Docker tools shall be bundled in the image. A browser-PWA "make available offline" download is optional, separate work; if provided it must show size and handle quota failure. | Docker image contains approved required assets. If browser offline downloads are implemented, size/quota/error paths are tested. |
| FR-30 | The registry `offline` value describes verified Docker/offline readiness, not guaranteed no-network operation on the hosted website. Every released Docker tool is expected to be `full`; exceptions require owner approval. | Each offline claim is backed by a test of the Docker profile with external networking disabled and recorded in `04-OFFLINE-FIRST-DECISIONS.md`. |
| FR-31 | Record the exact ffmpeg.wasm build, threading mode, licence and memory/file limits. Use R2/CDN for the online profile when appropriate and bundle the selected core into Docker. If multi-threading is used, verify COOP/COEP headers on Pages and on the container response. | Delivery and header checks pass on each applicable profile; decision and license are recorded. |
| FR-32 | The app shall document supported access patterns for secure-context features (microphone, screen capture, clipboard, service worker require HTTPS or localhost), including the known breakage when a Docker/Podman deployment is reached over plain HTTP on a LAN IP. | Documentation plus a manual check that an insecure context shows a clear error instead of silent failure. |
| FR-33 | ML tools shall record model size and licence. Obtain owner approval before including each model in the Docker image. The online profile may retrieve the approved weights from R2/CDN; Docker must include them locally before the tool is released as `full` offline. | Model provenance/size/licence is recorded; online retrieval passes; Docker offline test passes with the model in the image. |
| FR-34 | Where browser codec/format support varies, each affected tool shall define fallbacks and explicit error states. | Documented format matrix per tool; error state shown for an unsupported input. |
| FR-35 | The app shall publish a credits/licenses listing covering third-party WASM builds, ML models, JS libraries, and fonts. | Page or section exists in the built site and lists each dependency with its license. |
| FR-36 | Every tool shall follow the tool contract: `src/lib/tools/<tool-id>/` containing `Tool.svelte`, `logic.ts`, and `meta.ts`, with logic unit-tested where practical. | Directory structure matches; unit tests exist for `logic.ts` of each shipped tool. |
| FR-37 | Every catalogued tool shall be assigned to a phase (A, B, C, or D) and remain a separately approved increment; nothing in this PRD auto-approves any individual tool. | Phase assignment recorded in the §12 catalog; approvals tracked per tool. |
| FR-38 | User-facing copy, tool names, and documentation shall use British English spelling (e.g. "Normaliser", "Optimiser"). | Review pass over UI strings and docs; catalog names follow the convention. |
| FR-39 [NEW] | The Docker/offline profile shall run the app and every released tool with external network access disabled. This requirement does not apply to a fresh browser session on the online Pages site. | Playwright tool tests pass against the Docker image with external access blocked; container starts and serves with `--network none`. |
| FR-40 [NEW] | The external-asset audit shall be target-aware. Online output may reference only Pages, the configured R2 custom domain and explicitly approved CDN origins; Docker output must not require external runtime asset URLs. | Online origin-allowlist audit and Docker no-external-runtime-asset audit both pass. |
| FR-41 [NEW] | Every dependency/asset requires a documented source, version and licence. Assets that must be packaged for Docker require an entry (including size and checksum where applicable) and owner approval in the localisation register. Heavy assets require explicit per-asset approval. | Credits/licence audit passes; `04-OFFLINE-FIRST-DECISIONS.md` records approval for each Docker-localised asset. |
| FR-42 [NEW] | The container image shall be built online and run offline. Air-gapped machines receive the built image via `docker save` / `docker load`; `node_modules` is not vendored. | Documented, verified build/save/load procedure; offline container run passes. |
| FR-43 [NEW] | Tool routes shall be prerendered so each registered tool has its own HTML file in `build/tools/` and supports direct URL navigation/reload on Pages and in Docker. | `build/tools/<tool-id>.html` exists for every registered tool; direct reload is tested on both profiles. |
| FR-44 [NEW] | Show one global connection-state indicator. Do not present offline as an error; do not claim a tool is locally available unless its assets are present and its offline path is verified. | Online/offline UI tests verify the status is accurate and no per-tool alarm wording is used. |

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
-   Verify the presence of `build/index.html`, a
    `build/tools/<tool-id>.html` file for every registered tool (for
    example `build/tools/base64-image-encoder.html`), `build/_headers`,
    and `build/theme-init.js`.
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
8.  The landing page and every registered tool route (initially the
    Base64 image encoder) can be opened from the built preview.
9.  The toolchain migration does not unnecessarily alter application
    files.
10. Cloudflare Pages configuration uses `vp build` (or `npm run build`
    delegating to it) and `build` as the output directory.
11. [NEW] Every registry entry validates against the FR-21 field set,
    and every tool in the §12 catalog has all fields populated.
12. [NEW] The sidebar groups tools by category; the category and "works
    offline" filters and Fuse.js search compose correctly (FR-22,
    FR-23).
13. [NEW] Network inspection confirms per-tool lazy loading (FR-24), no
    upload/telemetry (FR-27), and that online asset requests match the
    documented Pages/R2/CDN allowlist.
14. [NEW] At least one worker-based tool demonstrates progress and cancel
    (FR-25); shared helpers produce clear errors for missing capabilities
    (FR-26).
15. [NEW] The registry's offline value is scoped to Docker/offline
    readiness and is backed by a recorded network-disabled verification
    (FR-30).
16. [NEW] FFmpeg WASM threading, limits and licences are recorded; COOP/COEP
    headers are verified on each relevant profile when required (FR-31).
17. [NEW] Secure-context access patterns are documented and an insecure
    context produces a clear error (FR-32).
18. [NEW] The credits/licences listing covers bundled and remotely delivered
    third-party assets (FR-35).
19. [NEW] Every shipped tool follows the FR-36 contract and is in the
    catalog with a phase assignment (FR-36, FR-37).
20. [NEW] The Docker target passes all-tool execution with external network
    access disabled (FR-39).
21. [NEW] The online asset audit passes against its origin allowlist; the
    Docker audit shows no required external runtime URLs (FR-40). Docker-
    localised assets have approved register entries (FR-41).
22. [NEW] The Docker image can be exported and loaded on a machine with no
    internet (FR-20, FR-42).
23. [NEW] Every tool has a prerendered HTML file and supports direct reload
    on Pages and Docker; connection-state UI is accurate (FR-43, FR-44).

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
-   [RESOLVED] **Docker/offline status for [W]/[M] tools:** every released
    Docker tool is expected to be fully offline (`full`). Heavy features
    (ffmpeg, ML models) must be bundled in the Docker image and need the
    owner's approval per asset before they are added. This does not require
    the online build to self-host or precache those assets.
-   [RESOLVED] **Build-invariant mismatch (surfaced during Stage 8/9
    execution):** the tool route `src/routes/tools/[id]/+page.ts` set
    `prerender = false`, so `build/tools/base64-image-encoder.html` was
    never emitted. Decision (owner, option a): prerender known tool
    routes by enumerating tool ids at build time via SvelteKit
    `entries`, and keep the invariant (FR-43). Implementation is a
    pending task in Stage 9A of the Technical Implementation Plan.
-   [NEW] **Heavy-asset approvals:** the exact ffmpeg.wasm build and each
    ML model (size, licence) still need owner approval before bundling.
    Size figures so far are estimates, not measurements.
-   [NEW] **Safari/iOS storage:** browser cache eviction and small quotas
    affect PWA-only use; Docker use is unaffected because assets are
    served from the container.

## 9. Docker/offline acceptance criteria

1. Build the Docker profile while package registries and approved download sources are reachable.
2. Confirm that the final image contains the app shell, prerendered tool routes, production assets, fonts, and every approved required library/WASM/model file.
3. Start the completed image with external network access disabled; verify the landing page, direct tool routes, and every released tool workflow.
4. Confirm that runtime requests for code/assets stay on the local container origin; no CDN, R2, npm registry, remote font, or API is required.
5. Confirm no user file, selection, recording, or result is uploaded and no telemetry is emitted.
6. Verify that the image archive can be transferred to a clean offline machine, loaded with `docker load`, and started without pulling any image or dependency.
7. Verify direct reload of each prerendered `/tools/<tool-id>` route.
8. If multi-threaded WASM is used, verify COOP/COEP headers in the container and on the Pages/R2 delivery path as applicable.
9. Verify supported secure-context behavior for microphone, screen capture, clipboard, and service-worker features.
10. Treat browser-PWA offline caching as a separate optional capability; if claimed, test it independently with the actual approved asset configuration.

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
-   [NEW] ffmpeg.wasm (approved R2/CDN source for online delivery if chosen;
    exact build, threading mode and licence obligations must be verified)
-   [NEW] ML runtime/model weights for Phase D tools (R2/CDN online delivery;
    Docker-localised weights are separately approved and size-recorded)
-   [NEW] A Web Worker harness pattern for CPU-heavy tools (no
    specific library assumed)
-   [NEW] A browser-capability detection helper (no specific library
    assumed)
-   [NEW] Fonts and runtime libraries for the online build may be bundled
    or loaded from approved CDN origins. Any files that must be localised
    for Docker are listed in the offline register and approved by the owner
    (FR-41).

The exact dependency versions in the source are scaffold examples and
must be resolved and verified as a compatible set before implementation.

## 11. Source boundary

This PRD preserves the existing app scaffold and distinguishes two deployment targets. Online delivery policy is defined in `05-ONLINE-DEPLOYMENT-PLAN.md`; Docker/offline packaging is defined in `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md`. Where the supplied scaffold does not define user-visible behavior or product policy, this document marks the point as unspecified rather than inventing a requirement.

## 12. Tool catalog --- three categories, 44 tools [NEW]

Tags: [L] lightweight (Canvas/Web APIs/pure JS); [W] needs a WASM/JS
library; [M] needs an ML model; [D] needs a device/permission API.
Phases: A = [L] tools; B = library-based [W] image/font tools;
C = ffmpeg-based audio/video tools; D = [M] ML tools. Every tool
remains a separately approved increment (FR-37).

All "Offline (target)" values below describe the Docker/offline profile and are targets, not verified claims. Every released Docker tool is expected to reach `full`; this does not mean the hosted website is guaranteed to run without internet. Heavy assets need owner approval before being bundled into Docker. No tool may display a full-offline claim until its Docker execution path passes network-disabled verification (FR-30). All "Notes" purposes are inferred from tool names only and must be confirmed before that tool's increment is approved.

### Images & Assets (17)

| # | Tool | Tag | Phase | Offline (target) | Status | Notes (inferred purpose --- assumption) |
|---|---|---|---|---|---|---|
| 1 | Image Atlas | TBD | A (provisional) | full | new | Purpose unconfirmed in source. Proposed equivalent: a per-media-type image format reference page. Needs decision. |
| 2 | Artwork Enhancer | [L] or [M] | A or D (provisional) | full | new | Scope undefined: non-ML sharpen/upscale ([L], A) vs. ML enhancement ([M], D). Needs decision. |
| 3 | Background Remover | [M] | D | full (model bundled; owner approval needed) | new | Remove image backgrounds via an ML segmentation model. |
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
| 6 | Auto Subtitle | [M] | D | full (model bundled; owner approval needed) | new | Generate subtitles from speech via speech-to-text. |
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
