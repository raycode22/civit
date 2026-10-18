# Civit --- Project Constitution

**Document type:** System rules / engineering constitution\
**Status:** Draft derived from the supplied Vite+ scaffold\
**Scope:** Toolchain, architecture boundaries, development workflow, and
verification rules

## 1. Purpose

Civit is a statically deployable web application built with SvelteKit.
The supplied scaffold establishes a tool-discovery/application shell and
a `base64-image-encoder` tool, with room to add further tools. This
constitution defines the constraints that future implementation work
must preserve.

[NEW] Product scope for this increment: 44 tools across three
categories --- Images & Assets, Audio & Video, and Typography & Text ---
catalogued in the PRD. Product inspiration: delphi.tools, used only as
a functional reference; do not copy its code, branding, or copy text.

## 2. Non-negotiable architecture rules

1.  **SvelteKit remains the application framework.** It owns routing,
    prerendering/SSR behavior, and adapter configuration.
2.  **Vite+ is the unified Vite-layer toolchain.** Use the `vp` CLI for
    development, builds, tests, and checks where supported.
3.  **Do not treat Vite+ as a replacement for SvelteKit.** Keep
    SvelteKit-specific configuration in `svelte.config.js`.
4.  **Keep the Vite+ migration confined to the toolchain layer** unless
    a separately approved feature requires application-code changes.
5.  **Static deployment is the target.** Use `@sveltejs/adapter-static`
    and preserve the expected `build/` output.
6.  **Keep tool implementations modular.** Tool metadata, UI, and
    processing logic live in the tool's own directory under
    `src/lib/tools/`.
7.  **Keep shared UI and infrastructure reusable.** Shared components,
    search, theme behavior, and tool types/registry belong under
    `src/lib/`.
8.  **Use TypeScript for application and configuration code where the
    scaffold already does so.** Preserve strict TypeScript settings.
9.  **Do not silently remove verification coverage.** Keep unit tests
    and Playwright smoke tests, and retain `svelte-check` unless its
    replacement is verified against Svelte files.
10. **Do not assume evolving Vite+ options are valid.** Confirm the
    installed CLI/config schema before relying on optional or
    version-sensitive behavior.

## 3. Offline/PWA policy

- Implement PWA behavior as a required feature, including a web app manifest, service worker, installability metadata, and an explicit caching strategy appropriate to the selected SvelteKit/Vite+ integration.
- Cache the application shell, required static assets, tool catalog/metadata, and the code needed for each tool advertised as offline-capable.
- Do not claim a tool works offline until its actual execution path has been verified with the browser network disabled.
- Avoid runtime dependencies on remote CDNs, remote fonts, external APIs, or dynamically fetched libraries for offline-supported workflows.
- Define cache versioning, update behavior, stale asset handling, and recovery from incomplete/failed cache installation.
- Provide an offline indicator or similarly clear UI state where users need to know whether they are offline.
- Document the distinction between a locally running Docker deployment and an installed browser PWA. Both must be tested if both are supported.
- Docker must serve all runtime assets from the local application/container. Persistent data must use an explicit volume only where persistence is required; do not store irreplaceable user data solely in an ephemeral container layer.
-   [NEW] PWA integration decision: before adopting any PWA
    integration, verify and record whether SvelteKit's native
    service-worker support (a `src/service-worker` module plus the
    `$service-worker` module) or a Vite+-compatible PWA plugin is the
    correct mechanism under the installed SvelteKit/Vite+ versions. Do
    not assume a plugin name. The scaffold already ships a hand-written
    `static/sw.js`; record whether it is kept, replaced, or superseded.
-   [NEW] Self-host every WASM binary and ML model file used by a tool.
    No runtime fetch from a CDN or any third-party origin.
-   [NEW] Do not precache heavy assets for every tool up front. Provide
    a per-tool "make available offline" action that shows the download
    size before fetching and reports success or failure.
-   [NEW] Handle storage-quota limits explicitly: check available
    quota before large downloads and surface a clear, recoverable error
    when quota is exceeded.
-   [NEW] Track each tool's offline support in the registry as `full`,
    `partial`, or `online-only`. No tool may be labelled `full` or
    `partial` in the UI until its network-disabled verification has
    passed.

## 4. Toolchain policy

-   Use `vp dev` for local development.
-   Use `vp build` for the production static build.
-   Use `vp preview` to inspect built output locally.
-   Use `vp check` for the configured lint/format/type-check workflow.
-   Use `vp test run` for a one-shot unit-test run.
-   Use `npx playwright test` for end-to-end smoke tests.
-   Keep package scripts as discoverable entry points that delegate to
    `vp`, plus explicit scripts such as `test:e2e` and `sync`.
-   Pin `vite-plus` to the exact version resolved and verified for the
    repository; avoid unverified floating toolchain changes.
-   Do not retain parallel ESLint/Prettier/Vitest setup by default after
    migration. Add a separate Svelte lint path only if required and
    documented.

## 5. Configuration ownership

  -----------------------------------------------------------------------
  Concern                             Owner
  ----------------------------------- -----------------------------------
  Routing, prerendering, static       SvelteKit / `svelte.config.js` and
  adapter                             route files

  Vite plugins and Vite+ lint,        `vite.config.ts`
  format, test settings               

  TypeScript compiler settings        `tsconfig.json`

  Browser automation                  `playwright.config.ts`

  Static assets and response headers  `static/`

  Shared components, search, theme,   `src/lib/`
  tool registry                       

  Route-level pages                   `src/routes/`

  Unit and E2E tests                  `tests/`
  -----------------------------------------------------------------------

Do not move adapter configuration into `vite.config.ts`; the scaffold
explicitly leaves it with SvelteKit.

## 6. Dependency and runtime rules

-   The scaffold expects Node.js and npm to be available unless the
    repository's chosen Vite+ installation/runtime workflow explicitly
    manages them.
-   Prefer the Node.js version specified by repository CI configuration.
    If none exists, select and document a supported version before
    setup.
-   Keep `.npmrc` policies: `engine-strict=true` and `save-exact=true`.
-   Do not assume global `vp` installation is appropriate for CI. Prefer
    a project-pinned `vite-plus` dependency and `npx vp` in CI when that
    is the chosen reproducible setup.
-   Install Playwright browser binaries separately when needed.

## 7. Quality gates

Before considering a change complete:

1.  Run dependency installation using the repository's selected
    workflow.
2.  Ensure SvelteKit sync has run and `.svelte-kit/tsconfig.json` exists
    before type checking if required.
3.  Run `vp check` and address reported issues.
4.  Run `vp test run`.
5.  Run `vp build`.
6.  Verify the expected static files and routes exist in `build/`.
7.  Run Playwright smoke tests where browser dependencies are available.
8.  Record any failed or skipped checks explicitly; do not describe an
    unexecuted check as passed.
9.  [NEW] For any tool whose `offline` registry value changes, run the
    tool's execution path with the browser network disabled and record
    the result.
10. [NEW] When a multi-threaded WASM component is present, verify that
    `static/_headers` and the container web server both serve the
    required COOP/COEP headers.
11. [NEW] Verify by network inspection that a normal tool workflow
    makes no request to a non-origin host and uploads nothing (privacy
    rule in §13).
12. [NEW] Update the credits/licenses list whenever a WASM build, ML
    model, font, or library is added or upgraded.

## 8. Required build-output invariants

After a successful static build, verify at minimum:

-   `build/index.html`
-   `build/tools/base64-image-encoder.html`
-   `build/_headers`
-   `build/theme-init.js`

These are explicit checks from the supplied scaffold, not an exhaustive
list of all generated output.

## 9. Version-sensitive caveats

The following are risks to verify against the actual installed Vite+
release:

-   Oxfmt configuration key compatibility with the proposed
    `singleQuote`, `trailingComma`, and `printWidth` settings.
-   Whether `vp check` invokes the necessary SvelteKit sync and covers
    Svelte-specific type analysis.
-   Whether `vp preview` accepts the intended port flags.
-   Whether Playwright's `webServer` command works with
    `vp build && vp preview`.
-   Whether Rolldown's output works with SvelteKit `adapter-static`.
-   Whether the selected SvelteKit, Svelte plugin, Tailwind, and Vite+
    versions are mutually compatible.

If a version-sensitive integration fails, prefer the documented
compatibility fallback over broad rewrites. The source mentions a
Rollup-compatible fallback as a possibility, but any specific flag must
be confirmed to exist before use.

## 10. Change discipline

-   Keep changes focused and reviewable.
-   Do not claim Vite+ migration is complete until install, checks,
    tests, build, preview, and output verification have been run or
    their omissions documented.
-   [REVISED] PWA/offline behavior is now a required feature (see §3).
    Do not add or replace a PWA integration until the
    SvelteKit-native vs. Vite+-compatible-plugin decision in §3 has
    been verified and recorded. Additional tools remain separately
    approved increments.
-   Preserve the distinction between requirements stated in the source
    and assumptions that still need validation.

## 11. Conflict resolution

When implementation details conflict, prioritize in this order:

1.  Explicit architecture boundaries in this constitution.
2.  SvelteKit's ownership of routing and static adapter behavior.
3.  The actual installed package versions and their verified
    configuration schemas.
4.  The repository's CI/runtime configuration.
5.  The proposed scaffold examples, which must be validated against
    installed versions.

## 12. Source limitations

This constitution is derived from the supplied Vite+ scaffold text. It
does not define product policies such as analytics, privacy, telemetry,
accessibility targets, or a complete security model because the source
does not specify them. Those decisions require separate
product/engineering input.

[REVISED] §13 now defines the privacy/local-only rule and §17 defines
licensing; analytics remains out of scope entirely. Accessibility
targets and a full security model are still undefined.

## 13. Privacy and local-only processing [NEW]

-   All tool processing happens in the user's browser on the user's
    device.
-   No user file, selection, recording, or derived output may be
    uploaded to a server or sent to a third-party API.
-   No telemetry, analytics, or tracking of any kind.
-   The only permitted network traffic is fetching the application's
    own self-hosted assets. Any tool that would require a remote
    processing service is out of scope.
-   Privacy claims must be verifiable: network inspection during a
    tool workflow must show no non-origin requests.

## 14. Tool contract [NEW]

Each tool lives in `src/lib/tools/<tool-id>/` and consists of exactly
three files:

-   `Tool.svelte` --- the tool's UI.
-   `logic.ts` --- the processing logic, unit-testable without the DOM
    where practical.
-   `meta.ts` --- tool metadata conforming to the shared registry
    type.

Rules:

-   Tools must not import from other tools; shared helpers live under
    `src/lib/`.
-   CPU-heavy work runs in a Web Worker with progress reporting and
    cancellation; `Tool.svelte` stays responsive.
-   Every tool declares its `requires` capabilities and its `offline`
    value honestly; capability failures produce clear error messages.
-   A tool is registered and routable only after its increment is
    separately approved.

## 15. Registry, categories, and discovery [NEW]

-   Registry fields: `id`, `name`, `category` (`images-assets` |
    `audio-video` | `typography-text`), `icon`, `description`,
    `status` (`new` | `beta` | `stable`), `offline` (`full` |
    `partial` | `online-only`), `requires` (subset of `wasm` |
    `ml-model` | `camera-mic-screen` | `clipboard`), and search
    keywords.
-   The sidebar is grouped by category; search uses Fuse.js over name,
    description, and keywords; a category filter and a "works offline"
    filter are available; status and offline badges are shown.
-   Only the three catalogued categories are in scope for this
    increment.

## 16. Heavy assets, offline claims, and secure context [NEW]

-   Self-host all WASM and model files; no runtime CDN dependency.
-   Each tool that needs heavy assets offers a "make available
    offline" download with the size shown; do not precache
    everything.
-   Storage-quota handling is mandatory for those downloads.
-   A tool's offline value is a claim that must be backed by an actual
    run with the network disabled; unverified tools make no offline
    claim in the UI.
-   ML tools: record model size, self-host the weights, and treat the
    tool as offline-capable only after the model is cached; otherwise
    mark it `online-only` or `beta`.
-   ffmpeg.wasm: use a self-hosted core; decide and record
    single-thread vs. multi-thread; serve COOP/COEP headers in
    `static/_headers` and in the Docker/Podman web server when
    multi-threading is used; document file-size and memory limits;
    verify the license obligations of the exact build used.
-   Secure context: microphone, screen capture, clipboard, and service
    workers require HTTPS or localhost. Plain-HTTP access over a LAN
    IP breaks them; document supported access patterns and surface a
    clear error otherwise.
-   Browser codec and format support varies; define fallbacks and
    explicit error states per tool.

## 17. Licensing and credits [NEW]

-   Record the license of every third-party WASM build, ML model, JS
    library, and font that ships or is fetched by the app.
-   Provide a credits/licenses surface listing them.
-   Do not ship a component whose license obligations are unverified;
    in particular, verify the obligations of the exact ffmpeg.wasm
    build before Phase C ships.
-   Product inspiration (delphi.tools) is functional reference only;
    do not copy its code, branding, or copy text.

## 18. Language convention [NEW]

-   Use British English spelling in all user-facing copy, tool names,
    and documentation (for example "Normaliser", "Optimiser"). Tool
    names in the catalog follow this convention.
