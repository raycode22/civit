# Civit --- Product Requirements Document

**Document type:** Product requirements\
**Status:** Initial draft based only on the supplied scaffold\
**Product name:** Civit

## 1. Product overview

Civit is a web application scaffold for a collection of
browser-accessible tools. The supplied implementation outline includes a
shared application shell, search, theme controls, reusable tool cards
and status badges, a file drop zone, and a `base64-image-encoder` tool.
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

### Out of scope unless separately approved

-   Adding a PWA plugin or offline/PWA behavior.
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

The exact dependency versions in the source are scaffold examples and
must be resolved and verified as a compatible set before implementation.

## 11. Source boundary

This PRD preserves what the supplied scaffold establishes. Where it does
not define user-visible behavior or product policy, this document marks
the point as unspecified rather than inventing a requirement.
