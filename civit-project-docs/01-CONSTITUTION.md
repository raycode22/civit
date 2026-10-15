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
-   Do not add a PWA plugin or additional tools as part of this scaffold
    unless that work is explicitly selected as the next increment.
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
