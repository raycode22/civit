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

## 8. Handoff note

The supplied text is a proposed scaffold and explicitly calls out
version-sensitive areas. Treat its sample package versions and
configuration as starting points, not proof that the exact combination
currently installs or builds. Verify against the repository's actual
package metadata, lockfile, CI, and installed Vite+ version before
declaring the migration complete.
