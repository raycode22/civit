# Civit Step-by-Step Build Guide for Qwen Coder (Browser)

**Purpose:** turn the Civit planning pack into a sequence of small implementation tasks that can be executed and reviewed in `https://coder.qwen.ai/`.

**Canonical repository:** GitHub. Treat Qwen Coder as the coding agent, not as the only place where the project exists.

**Required sequence:** foundation → online shell and tools → Cloudflare Pages deployment → PWA/offline → optional large offline engines → Docker.

This is an execution guide. It does not claim that Civit has been implemented or tested. Do not advance through a stage based only on the agent saying that it is complete; check the actual files, CI run, deployment, and acceptance criteria.

---

## 0. Working method: one scoped task at a time

Qwen Coder's public landing page describes code generation and export to GitHub. Community issue reports have described problems with workspace visibility, initialisation, and publishing. These reports are not proof that every session is affected, but they are sufficient reason not to use an agent workspace as the sole copy of a project.

- Create a GitHub repository first and connect it to Qwen Coder using the current UI.
- Keep the planning documents committed inside the repository at `docs/planning/`.
- Ask for one phase or one vertical slice per prompt. Do not ask for the entire product, PWA, Cloudflare, and Docker in one giant instruction.
- Review the diff before publishing it. If the UI commits/exports changes directly, make sure every task produces a recoverable GitHub commit or pull request.
- Keep `main` buildable. Use a feature branch when the UI supports it; otherwise save a GitHub commit after each verified task and do not combine unrelated changes.
- Run tests/build checks after every meaningful change. If the environment cannot execute commands, Qwen must say “not run” and give the exact command/CI workflow that will verify it. Never accept invented test results.
- If a task breaks the build, fix that first. Do not pile more work onto a broken baseline.
- Never paste API keys, access tokens, passwords, or private credentials into Qwen prompts or repository files.

### Suggested GitHub setup

1. Create a repository named `civit`. Keep it private while the product is early unless you specifically want public development.
2. Download and extract `civit-project-docs.zip`.
3. Add the Markdown documents to `docs/planning/` using GitHub's **Add file → Upload files** flow, or attach the documents to Qwen if the interface supports file context and ask it to copy them into that folder. Commit the planning pack before asking Qwen to implement the application.
4. Connect that repository in Qwen Coder. Confirm that it is working against the intended `civit` repository, not a generated coffee-shop/demo repository.
5. After every accepted task, confirm its changes reached GitHub. Periodically download a ZIP of the repository as an extra backup.

If the GitHub connection is unavailable, ask Qwen to export the generated project as a ZIP, download it, and preserve it before continuing. Do not let the only copy remain in a transient chat/workspace.

---

## 1. The reusable task wrapper

Paste this at the top of each implementation request, followed by the phase-specific prompt below. If a prompt already includes these rules, do not duplicate it unnecessarily.

```text
You are implementing Civit, a privacy-focused, local-first browser utility suite.

Before editing, read AGENTS.md and the relevant files in docs/planning/. Follow the constitution and PRD. Treat the committed repository as the source of truth.

Work only on the task described below. Inspect the existing project before changing it. Preserve working behavior and avoid unrelated refactors. Do not replace the stack, rewrite the application, or introduce new infrastructure unless the task explicitly requires it.

Use Astro static output, Svelte 5, TypeScript strict mode, pnpm, and Tailwind CSS v4. The initial app is client-side only: no application API, server adapter, database, authentication, analytics/telemetry SDK, or user-content upload backend. Do not add PWA or Docker work before its stage is approved. Do not add Rust/WASM, Turborepo, FFmpeg, PDF, or machine-learning dependencies without a specific approved feature and a size/licence/browser-support review.

Make the smallest complete change. Add or update tests and documentation with the code. Run the relevant checks and a production build if the environment supports execution. Report exactly which commands ran, whether each passed, and any command that could not be run. Never claim a test passed if you did not execute it.

At the end report: (1) files changed, (2) architectural decisions/dependencies added, (3) commands and real results, (4) known risks or follow-up work, and (5) a manual acceptance checklist. Do not publish/export/merge changes until I have reviewed the result, if the interface allows a review step.
```

## 2. Phase 0 — establish project instructions and decision records

### Prompt 0A — add a persistent agent guide; no application code yet

```text
Read every document in docs/planning/, especially:
- 01-constitution.md
- 02-prd.md
- 03-technical-implementation-plan.md
- 04-online-deployment-plan.md
- 05-offline-pwa-plan.md
- 06-docker-build-plan.md
- 07-research-and-stack-validation.md
- how_to_use_this.md

Do not implement the application in this task.

Create a concise root AGENTS.md that tells future coding agents how to work on Civit. Include the product purpose, non-negotiable privacy rules, chosen baseline stack, static-first deployment decisions, staged roadmap, commands that should exist once configured, tests-before-completion policy, and instruction to read docs/planning/ before architectural changes.

Create docs/decisions/0001-static-first.md recording why the initial deployment is a static Astro site on Cloudflare Pages, why large assets must stay out of Pages output, why PWA and Docker are deferred, and which future changes require an architecture decision record.

Create docs/BUILD_STATUS.md with a checklist of roadmap phases: foundation, shell, lightweight tool slices, online deployment, online MVP release gate, PWA, optional offline engines, Docker, later expansion. Mark only planning/repository preparation complete; do not claim code phases are complete.

Do not add dependencies or change any existing application code. If the planning documents conflict, list the exact conflict in your final report rather than silently resolving it.
```

**Checkpoint:** inspect and commit `AGENTS.md`, `docs/decisions/0001-static-first.md`, and `docs/BUILD_STATUS.md`.

---

## 3. Phase 1 — create the smallest valid Astro application

### Prompt 1A — bootstrap the static stack

```text
Implement Phase 0 foundation from docs/planning/03-technical-implementation-plan.md. Inspect the repository first and preserve the planning files.

Create the minimal buildable Civit application using:
- Astro with static output (`output: 'static'`)
- Svelte 5 through the official @astrojs/svelte integration
- TypeScript strict mode
- Tailwind CSS v4 using the official @tailwindcss/vite integration (do not use the old Tailwind v3 @astrojs/tailwind setup)
- pnpm with a committed pnpm-lock.yaml
- Vitest for unit tests and the Astro type-check tooling needed for `astro check`

Use mutually compatible current stable package versions based on the official documentation at implementation time. Do not pin obsolete versions copied from old examples. Use Node 22 LTS (Astro's current installation docs require Node 22.22.0 or newer); record the chosen runtime/package-manager version in the repository and CI later.

Create or update the minimum required files: package.json, pnpm-lock.yaml, astro.config.mjs/ts, svelte.config.js if required by the selected integration, tsconfig.json, src/pages/index.astro, src/styles/global.css, and one trivial unit test. Provide scripts for dev, check, test, build, and preview. The build must produce dist/ and must not require Cloudflare credentials or a server adapter.

Do not add product UI beyond a plain Civit starter heading. Do not add a PWA, Dockerfile, analytics, database, API route, auth, Rust, or heavy libraries.

Run dependency installation, `pnpm check`, `pnpm test`, and `pnpm build` if execution is available. If you cannot execute a command, state that clearly instead of claiming success.
```

**Checkpoint:** clean install/lockfile is reproducible; `check`, `test`, and `build` succeed. The `dist/` directory exists after the build. Commit this checkpoint before designing the UI.

If Qwen starts with `npm`, `yarn`, or `bun`, correct it before proceeding: this project uses **pnpm** so CI and deployment use a consistent lockfile.

---

## 4. Phase 2 — create the application shell before adding tool breadth

### Prompt 2A — design system and responsive layout

```text
Build the Civit application shell described in docs/planning/02-prd.md and docs/planning/03-technical-implementation-plan.md. Keep Astro responsible for static page structure and use Svelte only for interactive islands that need client-side state.

Implement:
- A distinctive, restrained Civit visual identity. Do not copy Delphi.tools branding or layout pixel-for-pixel.
- Responsive top navigation and mobile navigation with accessible focus/keyboard behavior.
- Home page with a short privacy statement, prominent tool search, category browsing, and a clear empty-search state.
- Shared tool-page layout with title, short description, input/workspace region, output/actions region, and a capability/privacy note.
- Global CSS variables for theme tokens, focus outlines, spacing and readable colors, with Tailwind CSS v4 utilities.
- A static 404 page, page titles/meta descriptions, favicon/app icon placeholders only if real assets are created, and a skip-to-content link.
- A simple theme toggle only if it can be implemented accessibly without adding unnecessary persistence. Persist low-risk preferences locally only.

Do not create fake tools that appear functional. Do not introduce user accounts, telemetry, remote processing, or file uploads. The shell must build statically and remain usable without hydrating every tool on the home page.

Add a short manual accessibility test checklist to docs/BUILD_STATUS.md. Run check, unit tests, and build.
```

### Prompt 2B — typed tool registry and routes

```text
Implement the typed tool registry and discovery flow described in docs/planning/03-technical-implementation-plan.md and the PRD information architecture.

Create a single typed source of metadata for tools, including at minimum slug, name, category, short description, keywords/aliases, and any capability/offline classification required by the plans. Use it to drive home-page search and category browsing. Avoid duplicating the same metadata in separate hand-maintained lists.

Only show tools marked implemented and tested in production navigation. A planned tool must not appear as if it works. Define safe behavior for no search matches and category pages with no published tools. Ensure routes use stable paths like /tools/json-formatter/ and direct navigation/refresh works in static output.

Start with a small registry containing only the implemented example tool(s). Add tests for search matching names, aliases, category and description, as well as invalid/empty search. Avoid unnecessary global state libraries.

Run check, tests and build. Report the generated route files in dist/ so direct-route behavior can be verified.
```

**Checkpoint:** inspect the shell on mobile and desktop sizes; verify keyboard focus and navigation. Confirm only completed tools are visible.

---

## 5. Phase 3 — build tools as complete vertical slices

Build one slice per task. Each slice includes the tool's UI, implementation, validation, tests, accessibility/status feedback, metadata and documentation. Do not create 11 empty routes and fill them later.

### Prompt 3A — JSON Formatter (first complete slice)

```text
Implement the JSON Formatter tool as the first complete Civit vertical slice, following the PRD and AGENTS.md.

Requirements:
- Input editor/textarea, Format, Minify, Clear, and Copy output actions.
- Use native JSON.parse/JSON.stringify; do not use eval or execute input.
- On invalid JSON, show a visible, accessible error and preserve the user's input. If reliable line/column information is available, show it; otherwise do not invent a location.
- Handle empty input, whitespace-only input, primitive JSON values, arrays, objects, escaped strings, Unicode, and malformed input.
- Keep input and output in memory only. Do not send or persist content.
- Provide useful labels, keyboard operation, status announcements for copy success/failure, and reasonable input size guardrails.
- Add unit tests for format/minify valid inputs, malformed JSON, primitive values, Unicode and whitespace.
- Add it to the tool registry only after its UI and tests exist. Add a concise per-tool usage note or update the product documentation.

Run tests and production build. Do not add a general code editor dependency unless a real requirement justifies it.
```

### Prompt 3B — UUID Generator and Password Generator

```text
Implement UUID Generator and Password Generator as two separate, fully tested Civit tools.

UUID Generator:
- Generate configurable batches of UUID v4 values using crypto.randomUUID() where supported or a correct Web Crypto fallback using crypto.getRandomValues.
- Do not use Math.random for security-sensitive generation.
- Validate the batch size and define an upper bound to prevent UI/memory abuse.
- Offer copy and downloadable plain-text output only after explicit user action.

Password Generator:
- Let users configure length and include/exclude lowercase, uppercase, digits and symbols.
- Require at least one enabled character set; validate impossible combinations and length bounds.
- Use Web Crypto with unbiased bounded sampling/rejection sampling rather than modulo-biased random selection.
- Make it clear the generated password is not uploaded or automatically stored. Never log or persist generated passwords.
- Test character-set restrictions, min/max length, invalid options, and deterministic helper logic. Do not assert a statistical guarantee from a small unit test.

Add each tool to the registry only after it is usable and tested. Add accessible feedback for copy and validation. Run the full checks/build and report the exact results.
```

### Prompt 3C — Word Counter and Base64 / URL Encoder

```text
Implement Word Counter and Base64/URL Encoder as separate tools.

Word Counter:
- Show character count, character count excluding whitespace, line count, word count, and an optional approximate reading time.
- Use Unicode-aware behavior and document the word-count rule. Do not claim language-perfect tokenization for every language.
- Handle empty input, whitespace-only input, emoji, combining characters, punctuation, and line endings.

Base64 / URL Encoder:
- Separate text Base64 encode/decode and URL component encode/decode actions.
- Correctly handle UTF-8 and non-ASCII text; do not use deprecated or binary-unsafe btoa/atob patterns without an explicit UTF-8 conversion layer.
- Invalid Base64 or malformed input must produce an actionable error, not an unhandled exception.
- Make clear Base64 and URL encoding are encodings, not encryption.

Add unit tests for all edge cases described above, keep processing local, add registry entries, and run full checks/build.
```

### Prompt 3D — Text Diff

```text
Implement the Text Diff tool from the PRD. Compare two user-provided text blocks and show additions/deletions clearly. Use a maintained diff algorithm library only if needed; justify its bundle cost first. Handle empty inputs, identical text, newline differences, Unicode and large-but-allowed inputs. Do not render user input as raw HTML; escape content through framework-safe text rendering. Provide an accessible non-colour-only indication of additions and deletions, copy actions where useful, input limits, tests, a registry entry, and local-only processing. Run all checks/build.
```

### Prompt 3E — Colour Converter and Contrast Checker

```text
Implement Colour Converter and Contrast Checker within the declared PRD scope. Keep the supported color notation list explicit and validate inputs instead of guessing. Use a small maintained color library only after reviewing its browser compatibility, licence and bundle footprint; otherwise use a focused, tested conversion implementation with documented limits.

Contrast Checker must implement the WCAG relative-luminance and contrast-ratio calculation correctly and state whether a selected text/background pair meets the relevant WCAG AA/AAA thresholds for normal and large text. Explain that a numeric result does not constitute a full accessibility audit. Do not rely on color alone to communicate pass/fail.

Test known color vectors, boundary values, invalid CSS colors, alpha/transparency policy, and contrast ratio results. Add accessible controls, copy/export where appropriate, registry entries, and run all checks/build.
```

### Prompt 3F — Unit Converter

```text
Implement the curated Unit Converter tool, with explicit supported units grouped by dimension (for example length, mass, temperature, area, volume and digital storage). Define a typed conversion table and never permit conversions between incompatible dimensions. Treat temperature as its own affine conversion logic rather than a simple multiplier. Document decimal/rounding behavior and avoid falsely precise output. Validate non-finite numbers, empty input, unsupported units and very large/small inputs. Add unit tests for representative conversion pairs and edge cases, accessible input/output controls, a registry entry and local-only processing. Run all checks/build.
```

### Prompt 3G — QR Generator

```text
Implement the QR Generator only after reviewing candidate package maintenance, licence, bundle size and SVG safety. Support a clearly defined text payload first; do not claim support for every QR mode. Keep generation client-side, validate payload length and report when a payload cannot fit the selected settings. Offer SVG/PNG export only if it is implemented and tested. Sanitize or safely generate exported SVG; never inject untrusted raw SVG into the page. Add tests for payload validation and output generation, accessible controls and registry integration. Avoid loading the QR library on unrelated routes. Run all checks/build.
```

### Prompt 3H — Image Resize / Compress

```text
Implement Image Resize / Compress only as a deliberately scoped browser feature. Use file inputs and browser Canvas APIs, feature-detect APIs/encoders, validate file type, byte size, decoded dimensions and total pixel count before expensive decoding, and show actionable errors. Provide width/height controls with aspect-ratio locking, a small explicitly listed output-format set, a quality setting only for lossy formats, and a user-triggered download. Do not claim AVIF/WebP/other encoder availability unless detected in the target browser. Revoke object URLs and release temporary references during cleanup. Avoid storing or uploading files. Add tests for pure validation/resizing math and browser tests for the main upload → resize → download path. Move processing to a Worker only when the implementation/measurement justifies it. Run checks/build and report browser limitations honestly.
```

**Important:** If the tool count becomes too large for reliable review, stop after each completed pair/tool and commit it. Correctness and real usefulness take priority over the number of items in the catalogue.

---

## 6. Phase 4 — test and harden the online product

### Prompt 4A — central quality gate

```text
Audit the current Civit repository against docs/planning/01-constitution.md, 02-prd.md, 03-technical-implementation-plan.md and how_to_use_this.md. Do not introduce new features in this task.

Verify package scripts, strict TypeScript/Astro checking, unit tests, formatter/linter if configured, and static build. Add or correct Playwright end-to-end tests for:
- Home loads and search filters tools.
- A known tool route loads when opened directly and after refresh.
- A representative tool works for a valid input and handles invalid/empty input.
- Keyboard navigation and visible focus work on core interactions.
- 404 handling is intentional.

Ensure the build is static, tool pages do not depend on server APIs, and the repository contains no secrets or unnecessary telemetry. Add CI that uses the pinned Node/pnpm versions and runs frozen install, checks, unit tests and build. Do not claim local UI or network testing unless actually performed. Document commands and coverage limitations. Fix all failures before reporting completion.
```

### Prompt 4B — security, privacy and performance review

```text
Perform a targeted release-readiness review of the implemented online Civit app. Inspect all network-dependent code, dependencies, file handling, generated HTML and the built dist/ output.

Check that user text/files never leave the browser, there is no analytics/telemetry or remote compute call, user input is rendered safely, tool inputs have limits, clipboard/download behavior is explicit, and file/object URL lifecycle is handled. Check dependency licences and package size for newly added libraries. Report actual initial JS/CSS sizes and identify unnecessary dependencies; don't invent benchmark numbers.

Review accessible labels/focus/status announcements and non-color-only status. Add/fix tests for any confirmed issue. Do not enable COOP/COEP, add a strict CSP, or add server functions as generic hardening. Report each finding as fixed, accepted risk, or blocked with evidence. Run all checks/build.
```

**Online release gate:** do not proceed to PWA until the static app builds from a clean checkout, all published tools have tests and error handling, direct production routes work, privacy/network inspection finds no user-content uploads, and the production deployment can be rolled back by reverting a commit.

---

## 7. Phase 5 — deploy online to Cloudflare Pages

Before asking Qwen to change deployment configuration, create a Cloudflare account/project and connect the GitHub repository. Keep server-side Pages Functions and the Astro Cloudflare adapter out of the static MVP.

### Prompt 5A — make the repository Pages-ready

```text
Prepare the existing static Civit project for Cloudflare Pages, following docs/planning/04-online-deployment-plan.md and current official Cloudflare/Astro documentation.

Requirements:
- Keep Astro output static; do not add the Cloudflare SSR adapter or Functions.
- Ensure pnpm-lock.yaml is committed and the build output is dist/.
- Add public/_headers with the documented conservative baseline: X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, X-Frame-Options: DENY, and Permissions-Policy: geolocation=(). Add suitable long-lived immutable caching only for verified fingerprinted asset paths and revalidation for HTML. Validate the actual paths in dist/ before writing rules.
- Do not set COOP/COEP by default. Do not add a strict Content-Security-Policy without testing generated scripts and future worker/resource requirements.
- Add clear Cloudflare Pages build instructions to README.md, including production branch, pnpm install/build, output directory dist, Node/pnpm configuration, and how to inspect deployment logs.
- Ensure direct routes and the 404 page are represented in the generated static output. Do not rewrite every unknown URL to the homepage.
- Do not put secrets in public env variables or the frontend bundle.

Run full checks/build and inspect dist/. State what still needs to be configured manually in the Cloudflare dashboard. Do not claim a live deployment unless it was actually created and verified.
```

**Dashboard settings for the current repository layout:**

- Production branch: `main` (or the chosen release branch).
- Build output directory: `dist`.
- Build command: use the exact pnpm flow supported by the current Pages build image; the repository should support `pnpm install --frozen-lockfile` and `pnpm build`.
- Root directory: repository root.
- Runtime: set a supported Node LTS consistent with the committed project/CI configuration.
- No Functions or server adapter for the MVP.

Cloudflare Pages currently documents a **25 MiB maximum for an individual asset**. Do not put a 100+ MB model or a large single WASM runtime into `dist/`. Large assets are a later, separate concern (e.g. versioned assets on an R2 custom domain).

### Prompt 5B — verify the deployment and document rollback

```text
Update docs/planning/04-online-deployment-plan.md only where implementation details have changed. Create docs/DEPLOYMENT_CHECKLIST.md with a manual production verification checklist:
- Home and tool URLs load over HTTPS.
- Direct URL and hard refresh work on representative nested tool routes.
- 404 URL returns the intended 404 page/status behavior.
- _headers actually appear on deployed responses.
- CSS/JS/assets load without console errors.
- Copy/download and at least one malformed-input case work.
- Browser Network panel shows no user text/file payload sent to a server.
- Cloudflare build/deploy status and preview URL are saved in release notes (do not commit secrets).
- Rollback procedure: revert the faulty commit and verify the previous deployment.

Do not state the site has passed these checks unless I provide the observed results. Separate items verified by automation from manual items I must check in the browser.
```

**Checkpoint:** first online deployment is healthy before starting PWA work. Continue shipping additional lightweight tool slices online while preserving this stable baseline.

---

## 8. Phase 6 — finish the online MVP before adding offline complexity

Ask Qwen to compare actual implemented registry entries against the PRD table. Each tool must be complete or clearly excluded from navigation; no placeholders. Use this prompt when the catalogue is nearing release.

### Prompt 6A — online MVP audit

```text
Compare the currently shipped Civit tool registry against the MVP list in docs/planning/02-prd.md. Produce docs/MVP_RELEASE_AUDIT.md with one row per proposed MVP tool and statuses: implemented/tested, intentionally deferred, or missing. Include test references and known browser limitations; do not label a tool complete based on a placeholder screen.

For each implemented tool, verify malformed/empty inputs, reasonable upper bounds, accessible labels and status, local-only processing, copy/export handling, unit tests and a production build. For image operations, verify file and decoded-pixel limits and browser encoder feature detection. Verify search/category metadata comes from the typed registry.

Fix confirmed bugs, but do not add new feature categories or PWA/Docker code. Run full checks/build and list remaining release blockers. Do not declare the online MVP release-ready while a shipped registry entry is broken or the production deployment has not been manually checked.
```

Once the online MVP passes its acceptance gates, record a stable release tag/commit or another durable GitHub checkpoint. This becomes the known-good baseline for PWA development.

---

## 9. Phase 7 — add PWA/offline after online stability

Do this only after the online release is stable. Test service-worker behavior on a real deployed HTTPS origin, not only the development server.

### Prompt 7A — PWA manifest, installability and conservative core cache

```text
Implement the first PWA stage from docs/planning/05-offline-pwa-plan.md. Before adding dependencies, inspect the current Astro/Vite versions and confirm the selected @vite-pwa/astro release supports them.

Add a valid web app manifest, real application icons, install metadata and service-worker integration. Use Workbox through the supported Astro PWA integration if its current compatibility is confirmed. Keep the precache deliberately small: static shell, offline fallback, and explicitly selected small assets/routes. Do not precache large model files or every generated asset by default. Do not configure an indiscriminate navigateFallback to /404.html that makes unknown URLs look valid.

Define accurate tool offline classifications: available offline after core cache, available only after a separate engine/model download, or online-only. Add a graceful offline page/status, cache versioning/old-cache cleanup, and a safe update behavior that does not interrupt a user operation without warning.

Do not promise permanent storage; browser cache can be removed or evicted. Do not add IndexedDB for arbitrary user content. Run checks/build and provide manual test steps for first install, warmed cache, offline reload, update, and cleared site data.
```

### Prompt 7B — implement and test offline readiness

```text
Build the offline verification and recovery behavior described in docs/planning/05-offline-pwa-plan.md.

The app must distinguish network status from actual tool readiness. For the first offline release, prove a small set of cached routes and simple tools operate offline after one successful online warm-up. Provide an understandable status indicator; do not show “offline ready” when required app code/data is absent. Handle missing cache, service-worker install failure, cache quota failure and update/reload recovery.

Add browser tests or clear manual instructions to test: successful online visit, wait for service worker readiness, disable network, navigate to cached route, hard reload, enter/compute tool data, close/reopen, install/update, clear storage, and retry online. Test the production deployment. Do not add heavy models, R2 integration, COOP/COEP, or Docker in this task.
```

**PWA exit gate:** cached routes and advertised simple tools demonstrably work offline after warm-up; update and recovery behavior is understood; documentation does not promise offline capability for non-cached tools.

---

## 10. Phase 8 — optional large offline engines/models

Only select a candidate when a concrete tool requires it. Large model delivery is separate from the Pages app. Pages assets have a 25 MiB per-file limit.

### Prompt 8A — add one heavy engine safely (not a generic framework)

```text
Implement offline engine support for exactly one approved Civit tool, following docs/planning/05-offline-pwa-plan.md and docs/planning/04-online-deployment-plan.md. Before coding, provide a short recommendation for the selected engine/runtime covering licence and model terms, package maintenance, browser compatibility, transfer size, decoded/runtime memory, COOP/COEP/CORS needs, and a non-heavy fallback. Do not proceed with an unapproved or unclear licence.

Do not place the large engine/model in Cloudflare Pages dist/ or in the default precache. Use a versioned immutable asset URL on an approved host such as an R2 custom domain. Implement explicit user-triggered download, expected byte size, progress, cancel/retry where supported, cryptographic integrity checking against a published trusted hash, cache versioning, storage estimate, remove-download action and recovery from interrupted download or QuotaExceededError.

Keep user files and results local. Avoid telemetry. Use a Worker for heavy CPU work if justified and ensure the main UI can cancel/track the operation. Enable COOP/COEP only if the selected engine requires it and only after testing all origins/resource policies. Preserve a single-threaded/fallback path when feasible.

Add tests for asset integrity failure, interrupted downloads, cache removal, engine version upgrade and “not available offline” states. Run checks/build and document the exact manual browser/device tests still needed.
```

Do not batch 3-4 media engines in the same request. Approve each engine separately after the preceding one passes its offline gate.

---

## 11. Phase 9 — package a Docker image after the app is stable

### Prompt 9A — static multi-stage Docker build

```text
Implement Docker support from docs/planning/06-docker-build-plan.md only after the online app and PWA baseline are stable.

Create a multi-stage Dockerfile: a pinned supported Node build image with corepack/pnpm builds the static app, then a pinned unprivileged Nginx runtime serves the generated static files. Use a non-root runtime and unprivileged port. Add .dockerignore, deploy/nginx.conf and an appropriate health check. Keep the default image small and do not include optional large ML/FFmpeg assets.

Nginx must serve Astro's real route structure and 404 behavior, use correct MIME types including application/wasm if relevant, use safe cache headers for fingerprinted assets and revalidation for HTML, and reproduce the required security headers. Cloudflare public/_headers is not an Nginx configuration and must not be relied on inside Docker. Do not add a catch-all that makes every unknown path return the home page.

Default run instructions must bind to 127.0.0.1 only. Use explicit pinned base-image versions, not latest. Test direct routes, 404s, headers, health, and non-root execution. If Docker cannot be executed in this environment, say so and provide the exact commands/CI workflow needed to verify the image; do not claim it passed.
```

### Prompt 9B — container verification and documentation

```text
Add docs/DOCKER.md covering the actual Dockerfile, prerequisites, exact build/run/stop/update commands, published port, local URL, image variant limitations, and how to inspect logs/health. Ensure the example uses loopback binding by default (for example `-p 127.0.0.1:8080:8080` when that matches the actual image port).

Create or extend CI to build the core Docker image. If Docker is available, run it and test home, representative nested routes, 404 behavior, MIME types, cache/security headers and non-root process. Record the final image size. Do not claim air-gapped operation for features that still fetch assets from the internet.

Design an optional `civit:offline` image only when specific model/engine assets are legally approved, versioned and checksum-verified. It must fail the build when required offline assets are missing. Keep its model assembly separate from the normal Cloudflare Pages dist output and the lightweight core Docker image.
```

**Docker exit gate:** a clean commit can build and run the image; routes and headers are correct; the web server runs non-root; the exact offline capabilities bundled are documented; no unlicensed model is accidentally included.

---

## 12. Troubleshooting prompts for Qwen Coder

### If it tries to rewrite the whole repository

```text
Stop. Do not rewrite or regenerate the repository. Compare the current diff to the task scope and revert unrelated changes. Preserve existing architecture, planning docs, working tests and package lockfile. Show the minimal proposed diff first, then implement only the requested change.
```

### If it reports tests without evidence

```text
Your last response does not establish that the tests actually ran. Execute the exact available check/test/build commands and report their output and exit status. If the environment cannot execute them, mark them NOT RUN and add/identify a reproducible CI workflow. Do not infer test success from code inspection.
```

### If dependency installation/build fails

```text
Do not upgrade every package or switch package managers. Reproduce the first failure, identify the incompatible package/version/runtime, and check its current official release notes/docs. Make the smallest compatible change, update pnpm-lock.yaml with pnpm, then rerun check, test and build. Report the root cause and exact versions changed.
```

### If it adds a backend, analytics or remote processing

```text
This violates Civit's constitution for the online MVP. Remove the API/backend/auth/database/analytics or remote processing introduced by this change. Keep the tool local-first and browser-only. If an exceptional remote capability is genuinely required, stop and propose an ADR plus PRD/constitution changes; do not implement it silently.
```

### If Cloudflare deployment fails

```text
Inspect the actual Cloudflare build log, Node/pnpm version, frozen lockfile install, build command and dist/ output. Do not switch to SSR or add a Worker adapter as a blind workaround. Fix the static build/deployment mismatch, verify routes in dist/, and report which checks still require the Cloudflare dashboard.
```

### If the PWA reports offline-ready incorrectly

```text
Audit the readiness calculation. Network status alone is not proof that a route or tool is cached. Check the required page assets and tool engine/data are present, version-compatible, readable from the expected cache, and usable with the network disabled. Correct the label and tests. Do not claim persistent storage is guaranteed.
```

---

## 13. Build status board and release gates

Keep `docs/BUILD_STATUS.md` current after each merged phase. Use GitHub Issues or a project board for individual tools, but do not make board state the only record of technical status.

| Phase | Required evidence | Do not proceed when |
|---|---|---|
| Foundation | Lockfile, documented runtime, checks/tests/build, static dist | Clean install/build does not work or repository checkpoint is missing |
| Shell/registry | Responsive pages, typed registry, routes, search, no fake published tools | Direct routes fail or unimplemented tools appear usable |
| Tool slice | Unit/browser tests, validation, privacy and accessibility checks | Happy path only works or malformed inputs break the app |
| Online deployment | Cloudflare deployment URL, direct-route/404 checks, headers and network review | Build is not reproducible or deployment is not manually verified |
| Online MVP | PRD audit, release blockers resolved, known-good commit/tag | Published tools are incomplete or privacy boundary is unverified |
| PWA | Installability, offline tests, cache lifecycle/update/recovery | Offline claims are inferred rather than tested |
| Heavy offline engine | Licence/hash/size review, download/retry/quota tests and real offline execution | Asset provenance, integrity or actual offline use is not proven |
| Docker core | Clean build, non-root runtime, route/header/health tests | Image is unverified or claims include remote-only features |
| Docker offline | Required assets bundled and hashes checked; outbound-network-disabled test | Any advertised offline tool still requires internet or an absent asset |

## 14. Official documentation to consult when implementing

Package versions and host settings change. Use these sources when executing the relevant phase rather than copying versions from old snippets:

- Astro installation and Node prerequisites: <https://docs.astro.build/install-and-setup/>
- Astro Svelte integration: <https://docs.astro.build/en/guides/integrations-guide/svelte/>
- Tailwind CSS v4 with Astro: <https://tailwindcss.com/docs/installation/framework-guides/astro>
- Vitest: <https://vitest.dev/guide/>
- Playwright: <https://playwright.dev/docs/intro>
- Cloudflare Pages + Astro: <https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/>
- Cloudflare Pages limits (25 MiB per asset): <https://developers.cloudflare.com/pages/platform/limits/>
- PWA integration for Astro: <https://github.com/vite-pwa/astro>
- MDN PWA caching guide: <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching>
- MDN offline/background operation: <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation>
- Docker multi-stage builds: <https://docs.docker.com/build/building/multi-stage/>
- Docker security: <https://docs.docker.com/engine/security/>
- Qwen Coder browser site: <https://coder.qwen.ai/>
- Qwen Coder GitHub export description: <https://coder.qwen.ai/>
- Community issue on workspace visibility/publishing (anecdotal, not authoritative): <https://github.com/QwenLM/Qwen-Agent/issues/783>
- Community issue on project initialisation (anecdotal, not authoritative): <https://github.com/QwenLM/Qwen-Agent/issues/787>
