# Civit Constitution

**Status:** Proposed initial constitution  
**Product:** Civit — a privacy-first, local-first utility suite  
**Derived from:** Supplied Delphi.tools analysis, revised against current platform documentation

## 1. Mission

Civit gives people a coherent collection of focused tools for text, development, colour, images, documents, media, and related creative work. The default experience should be useful without an account, should avoid sending user content to a server, and should remain usable when the user has no network connection for capabilities that have been explicitly made offline-ready.

Civit may be inspired by the breadth and workflow orientation of Delphi.tools, but it must have its own implementation, interface, tool definitions, and brand. This document does not assert ownership of or permission to copy any third-party assets or source code.

## 2. Constitutional principles

### Article I — Local processing by default

1. User-entered text and user-selected files are processed in the browser unless a future feature has an explicit, reviewed, user-visible reason to send data elsewhere.
2. A tool must not upload, proxy, log, or persist user content silently.
3. Any feature that contacts a remote service must state what data leaves the device, to whom, for what purpose, and whether that traffic is required.
4. User files should remain in memory for the duration of an operation unless the user explicitly exports or saves a result. Persistent drafts or settings must be opt-in or clearly user-controlled.
5. A network panel review of representative tool flows is part of privacy acceptance testing.

### Article II — No account required for core utilities

1. Core tools work without authentication, user profiles, or a server-side database.
2. Civit will not introduce accounts merely to save local preferences or unlock basic functionality.
3. If collaboration or synchronization is proposed later, it is a separate product decision with an explicit threat model and data lifecycle.

### Article III — Honest offline support

1. Offline operation is an engineering property to prove, not a marketing label.
2. Core pages and simple utilities should work offline once their required static assets are cached.
3. Heavy engines and ML models are optional downloads unless measured product requirements justify making them part of a separate offline bundle.
4. The UI must disclose when a tool needs an initial download, is not offline-ready, or cannot work in the current browser.
5. Browser storage can be evicted or cleared. Civit must provide recovery behavior and must never promise permanent cache retention.

### Article IV — Static-first deployment

1. The online MVP is a statically generated site hosted on Cloudflare Pages, without Pages Functions, API routes, or a required runtime server.
2. Every production tool runs client-side unless an approved architectural decision changes that boundary.
3. The app should remain portable to another static host and to a self-hosted static container. Cloudflare-specific behavior must be limited to deployment configuration where possible.
4. Large assets must respect the selected host's per-file limits. Cloudflare Pages currently limits an individual asset to 25 MiB; files larger than that must not be copied into the Pages output.

### Article V — Small and deliberate dependency surface

1. Use the proposed Astro + Svelte 5 direction unless evidence from a working vertical slice shows it is unsuitable.
2. Prefer platform APIs for simple operations and well-maintained, narrowly scoped libraries for complex operations.
3. Add libraries only when their maintenance status, license, bundle/runtime cost, browser support, and security posture are acceptable.
4. A framework or build tool is not a performance guarantee. Civit measures production bundle size, startup cost, and responsiveness.
5. Do not add a monorepo orchestrator, Rust/WASM toolchain, media codec stack, or model runtime until a real feature needs it.

### Article VI — No main-thread abuse

1. The UI thread is responsible for interaction and rendering, not long-running transforms.
2. Heavy parsing, compression, encoding, image transforms, PDF work, and inference should execute in Web Workers or suitable browser-native asynchronous APIs.
3. Worker use is guided by measured complexity and memory pressure. Small arithmetic operations should not be forced through worker RPC without a benefit.
4. Long tasks must expose progress or cancellation where technically feasible and must release object URLs, worker instances, temporary buffers, and other large resources.
5. Performance goals are targets to measure, not guarantees such as “constant 60 FPS.”

### Article VII — Accessibility is a release requirement

1. Core navigation and every tool must be operable by keyboard.
2. Interactive controls need accessible names, visible focus, semantic status/error messages, and sensible screen-reader behavior.
3. Colour is never the only means of communicating status.
4. Contrast, reduced-motion preferences, zoom/reflow, and touch input must be considered in component design.
5. Headless UI primitives such as Bits UI may help but do not replace application-level accessibility tests.

### Article VIII — Security and user trust

1. No user content is emitted into telemetry, error reporting, URLs, or console output in production.
2. Do not add third-party trackers, ad systems, remote fonts, or runtime CDNs to the core app.
3. Keep dependency lockfiles current and scan dependencies in CI. Treat files and imported documents as untrusted input.
4. Do not render unsanitized user-provided HTML or SVG as trusted markup. Any SVG importing/exporting path must be reviewed for script, external-resource, and URL hazards.
5. Security headers must be selected deliberately. Do not enable cross-origin isolation globally until the app needs it and cross-origin assets have been tested against the resulting policy.
6. Password generation must use a cryptographically secure browser source such as `crypto.getRandomValues`; ordinary `Math.random()` is unacceptable for security-sensitive randomness.

### Article IX — Tool quality and composability

1. Each tool owns its input contract, output contract, validation rules, unsupported cases, tests, and documentation.
2. Shared visual primitives and tool metadata should be reusable without coupling unrelated tools to one giant component.
3. Tool workflows may be introduced later, but each operation must declare input/output types and validate compatibility between steps.
4. A utility is not considered complete solely because its name appears in navigation.

### Article X — Licensing and provenance

1. Audit dependencies and assets for license compatibility before release.
2. Do not assume Delphi.tools’ reported 0BSD license grants rights to its code, branding, design, or model files for Civit.
3. Keep notices and attribution where required by source licenses.
4. Decide Civit’s own license before publishing source. Name/domain/trademark availability must also be checked before public branding; this plan does not constitute legal clearance.

## 3. Decision hierarchy

When requirements conflict, decide in this order:

1. User privacy and security.
2. Correctness and preservation of user files.
3. Accessibility and recovery from errors.
4. Offline honesty and portability.
5. Performance and maintainability.
6. Feature breadth and visual polish.

## 4. Constitutional review triggers

The following changes require an explicit architecture decision and review against this constitution:

- introducing server-side file processing or a backend API;
- adding analytics, crash reporting, authentication, or remote synchronization;
- making third-party network calls from a core tool;
- persisting file content or large drafts;
- adding cross-origin isolation headers;
- adopting a mandatory model download larger than 25 MiB;
- adopting Rust/WASM as a shared core or adding a native CLI;
- changing the static hosting strategy or adding Cloudflare Workers/Pages Functions.

## 5. Release pledge

Civit should explain what it does, where processing happens, what gets cached, what requires a download, and what will not work in a given browser. When a capability is constrained, the product should communicate the constraint rather than quietly falling back to uploading data or returning misleading output.
