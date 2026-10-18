# Civit --- Multi-Tool Web App: Project Constitution

**Document type:** System rules / engineering constitution\
**Status:** Revised for two delivery targets: online Cloudflare Pages + R2, and a separate self-contained Docker/offline build.\
**Scope:** Toolchain, architecture boundaries, development workflow, and
verification rules

## 1. Purpose

Civit is a multi-purpose collection of browser-based tools for Images & Assets, Audio & Video, and Typography & Text. Tool processing is client-side: user files and outputs remain on the user's device. The product has two distinct delivery targets built from the same application source:

1. **Online web version:** a statically generated SvelteKit application deployed to Cloudflare Pages. Large public runtime assets may be delivered by the already-selected Cloudflare R2 bucket, and approved third-party CDNs may be used where they provide a measured advantage.
2. **Docker/offline version:** a separate build profile that includes every approved runtime dependency and asset required by released tools. Once the image is built or transferred to a machine, app runtime must not depend on the internet.

The online deployment is the immediate release target. The Docker/offline target has its own asset-localisation register, build output validation, packaging, and network-disabled acceptance tests. A requirement belonging to one target must not silently be applied to the other.

The app shell and the Base64 image encoder are the architectural reference slice. The product scope plans for 44 tools across the three categories catalogued in the PRD. Product inspiration such as delphi.tools is a functional reference only; do not copy its code, branding, or copy text.

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

## 3. Delivery profiles and offline policy

### 3.1 Online profile (primary deployment target)

- Build a static site with SvelteKit `@sveltejs/adapter-static` and publish `build/` to Cloudflare Pages.
- Use Cloudflare R2 as the large-asset origin. Keep ordinary application assets and npm dependencies bundled by Vite unless a runtime CDN provides a clear performance or maintenance benefit.
- The online profile may request public libraries/assets from the Pages origin, the configured R2 custom domain, and explicitly approved third-party CDN origins. These origins must be versioned/pinned where possible, have verified licences, and be recorded in the online asset inventory.
- The online website is allowed to depend on an internet connection. It must not claim that every tool works offline merely because it is served as a static site or is installable as a PWA.
- Tool implementations still process user content locally. The permission to load runtime assets online does not permit uploads, remote processing, analytics, or telemetry.
- Optimise initial loads through route/tool lazy-loading, cacheable content-hashed assets, compression, and deferring heavy assets until their tool is opened.

### 3.2 Docker/offline profile

- Docker is a separate build and release target. The image is built while package registries and approved asset sources are reachable, then runs without external network access.
- Every released Docker tool must work with required assets packaged into the image. No required runtime request may go to a CDN, R2, npm, an API, remote fonts, or another external origin.
- Docker-specific localisation is tracked in `04-OFFLINE-FIRST-DECISIONS.md`. For any approved bundled asset, record source, version, licence, size, checksum, and update procedure. Obtain explicit approval before bundling heavyweight features (approximately 50 MB or more, including FFmpeg cores and ML model weights).
- The Docker release is tested with the container's external network unavailable, and the image export/import path is tested for air-gapped machines.

### 3.3 PWA and browser cache

PWA installation and service-worker caching may improve repeat visits, but they are not a substitute for the Docker/offline guarantee. Browser offline behavior for the online site is a best-effort enhancement unless a specific set of routes and tools has a separate, passing offline test. If it is not implemented or verified, do not show a full-offline claim. Keep caching versioned, recoverable, and quota-aware if persistent browser caching is supported.

### 3.4 Shared rules

- Preserve lazy-loading for individual tool code and heavy libraries.
- Keep tool routes prerendered so direct URLs can be served by static hosting and local Nginx.
- Show connection state calmly; do not imply that an un-cached remote asset is available offline.
- Document the distinction between online CDN/R2 delivery and Docker-local assets. Do not introduce separate source trees when a build-time target setting and explicit asset resolver can safely support both profiles.

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
-   Build policy is target-specific. The online Pages build installs
    dependencies from the lockfile and may use its approved online asset
    origins at runtime. The Docker builder installs dependencies and
    acquires approved assets at build time, then copies only production
    output and required runtime assets into the final image.
-   Do not commit `node_modules` or vendor build tooling into Git.
    Air-gapped Docker users receive the completed image with
    `docker save` / `docker load`, including its base-image layers.
-   The Docker/offline build must use local paths for fonts, CSS,
    JavaScript libraries, WASM, and model weights. The online profile is
    allowed to use configured R2/CDN origins.

## 7. Quality gates

Before considering a shared code change complete:

1. Install from the committed lockfile with the repository's selected workflow.
2. Run `vp check`, `vp test run`, and `vp build`; run `svelte-check` explicitly if Vite+ does not cover Svelte diagnostics.
3. Verify the expected static routes/assets and run Playwright smoke tests where browser dependencies are available.
4. Record failed, skipped, and blocked checks honestly.
5. Inspect network behavior for both profiles. Online tests must show only Pages, the configured R2 domain, and explicitly approved CDN origins; neither profile may upload user content or emit telemetry.
6. Run Docker/offline tests for every tool labelled `offline: full`. The required asset set must be present in the image, and runtime must work with external networking disabled.
7. If multi-threaded WASM is used, verify COOP/COEP and MIME/CORS headers on every deployment path that serves the relevant resources.
8. Update credits/licences when a dependency or asset is added or upgraded. The Docker localisation register applies to assets that must be included in the offline image.
9. Use a target-aware asset audit: enforce an allowlist on online output and fail the Docker build if a required runtime asset points to an external URL.
10. Do not claim browser-PWA offline readiness unless that browser-cache path has its own recorded, passing tests.

## 8. Required build-output invariants

After a successful static build, verify at minimum:

-   `build/index.html`
-   `build/tools/<tool-id>.html` for every registered tool (for example
    `build/tools/base64-image-encoder.html`)
-   `build/_headers`
-   `build/theme-init.js`

Tool routes are prerendered (decision recorded in
`04-OFFLINE-FIRST-DECISIONS.md`), so each registered tool must have its
own HTML file. Tool ids are enumerated at build time through SvelteKit's
`entries`. This supports direct-route reloads on Pages and on the local
Docker server; Docker offline verification additionally confirms that the
required assets are present in the image. These are minimum checks, not
an exhaustive list of all generated output.

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
-   [REVISED] Do not make optional browser-PWA offline caching a release
    gate for the online website. If a PWA integration is added or changed,
    verify SvelteKit-native service-worker support versus a Vite+-compatible
    plugin under the installed versions and document the decision. Docker
    offline readiness remains a separate mandatory target.
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

[REVISED] §13 now defines the privacy/local-only rule, §17 defines
licensing, and §19 defines dependency localisation approval; analytics
remains out of scope entirely. Accessibility
targets and a full security model are still undefined.

## 13. Privacy and local-only processing

- All tool processing happens in the user's browser on the user's device.
- No user file, selection, recording, or derived output may be uploaded to a server or sent to a third-party API.
- No telemetry, analytics, or tracking of any kind.
- The online profile may fetch application code and public assets from the Pages origin, configured R2 custom domain, and explicitly allowlisted CDNs. Such requests must not contain user files or conversion data.
- The Docker/offline profile may fetch runtime assets only from the container/local origin; after startup, no external runtime request may be required.
- Privacy claims must be tested with network inspection. Online tests verify the request-origin allowlist and absence of uploads; Docker tests verify no external runtime requests and no uploads.

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
    value honestly; `offline` describes verified Docker/offline readiness,
    not the behavior of a fresh online browser session. Capability failures
    produce clear error messages.
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
    description, and keywords; category and Docker/offline-readiness filters
    are available. Badge copy must not imply that the online site works offline
    before assets are locally available.
-   Only the three catalogued categories are in scope for this
    increment.

## 16. Asset delivery, offline guarantees, and secure context

- Use profile-specific asset resolution. Online assets may be bundled into Vite chunks, served from Pages, fetched from the configured R2 custom domain, or loaded from approved/version-pinned CDNs. Docker/offline assets must resolve to files packaged into the image.
- Keep ordinary npm packages in the lockfile and install them during the build. Prefer bundling dependencies needed for app startup. Use runtime CDN loading only when there is a clear performance, cache-sharing, or bundle-size benefit, and test failure behavior.
- For large assets, use R2 on the online profile to avoid Cloudflare Pages' 25 MiB per-file limit. Use immutable cache headers for versioned/content-hashed assets and shorter cache lifetimes for mutable entry points.
- Heavy Docker assets (FFmpeg core, ML models, assets around 50 MB or larger) require explicit approval before acquisition or bundling. Record measured size, checksum, licence, source, and version in the decision register.
- A tool's `offline` registry value describes its tested readiness in the Docker/offline profile. It does not promise that a fresh browser visit to the online site will run without internet. If optional browser-cache support is implemented, its capability must be labelled separately and backed by actual tests.
- ML tools require approved model weights in the Docker image before they can be declared fully offline. The online target may load an approved model from R2/CDN, but the user’s input and output remain local.
- FFmpeg-based tools must use a reviewed FFmpeg WASM build. Record single-thread vs multi-thread selection, licences and memory/file limits. Verify COOP/COEP headers on the relevant Pages/R2 and Docker responses if multi-threading is selected.
- Microphone, screen capture, clipboard and service workers require a secure context or supported local origin. Document HTTPS/localhost access and show a clear error for insecure LAN-IP origins where the relevant API is blocked.
- Browser codec and format support varies; define fallbacks and explicit error states per tool.

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

## 19. Dependency and asset approval

- Every dependency or asset used by either release target must have a verified licence and documented source/version. Record third-party assets in the credits/licences surface even when delivered through a CDN.
- The `04-OFFLINE-FIRST-DECISIONS.md` localisation register is mandatory for fonts, libraries, WASM binaries, and models that must be packaged into the Docker/offline image. It is not a requirement to copy every online CDN asset into the repository.
- Heavy assets (approximately 50 MB or more, including FFmpeg cores and ML weights) require an explicit owner decision before acquisition or distribution in either target.
- Pin versions or immutable URLs where practical, verify checksums for downloadable binary assets, and keep an update/rebuild path documented.
- Size figures in planning documents are estimates until measured; record the measured size when each asset is added.
