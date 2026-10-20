# Civit Product Requirements Document (PRD)

**Status:** Initial baseline  
**Product name:** Civit  
**Platform:** Responsive web app, later PWA and self-hosted Docker image  
**Primary deployment:** Cloudflare Pages static hosting  
**Product model:** Free-to-use, local-first toolkit; no account required for core functionality

## 1. Product summary

Civit is a browser-based toolbox for everyday developer, design, text, colour, and asset tasks. It consolidates small utilities behind consistent navigation, predictable input/output behavior, searchable discovery, and a shared visual system. The long-term direction may include media processing, PDF manipulation, local inference, tool workflows, and CLI parity, but the product will be delivered in slices rather than attempting to launch 80+ utilities at once.

The initial product deliberately uses browser-native APIs and TypeScript for simple tools. Expensive runtimes, Rust/WASM kernels, neural models, and large media codecs are later additions that must justify their cost through measured capability and performance needs.

## 2. Problem statement

Users repeatedly switch between disconnected online utilities. This creates friction, inconsistent UI, unclear privacy practices, avoidable uploads of sensitive content, and poor offline behavior. Civit aims to provide a consistent local-first workspace where the user can discover a tool, perform a task, and export the result without registering or sending the source material to a server.

## 3. Target users

- **Developers:** format and inspect JSON, generate UUIDs, inspect JWT payloads locally, test regular expressions, encode text, and construct request examples.
- **Designers and content creators:** convert colours, check contrast, resize or compress images, generate palettes, and prepare assets.
- **Writers and general users:** count words, compare text, transform text encodings, and use simple calculators.
- **Privacy-conscious users:** process files locally and avoid uploading client content to third-party utility sites.
- **Intermittent-connectivity and self-hosting users:** use cached core tools offline, then optionally run a self-hosted container.

These are working personas to guide MVP choices; formal user research should validate their needs before broad tool expansion.

## 4. Product goals

1. Ship a useful, responsive online MVP with no application server required.
2. Make local processing and network behavior understandable and verifiable.
3. Establish a registry-driven architecture that supports consistent tool discovery and future expansion.
4. Keep the home/category shell lightweight and load tool JavaScript only where needed.
5. Build the PWA and Docker deployment from the same static build output where possible.
6. Add offline readiness incrementally, with optional downloads for large assets.
7. Keep each utility testable and isolated enough to evolve without destabilizing the whole app.

## 5. Non-goals for the online MVP

- User accounts, cloud sync, teams, billing, subscriptions, ads, or user profiling.
- Server-side file upload, remote transcoding, remote AI inference, or a general-purpose API.
- A native mobile application or desktop executable.
- A complete clone of Delphi.tools or immediate implementation of all described utilities.
- Mandatory download of a 100+ MB ML model.
- Multi-threaded WASM as a launch requirement.
- A workflow graph editor or cross-tool macro engine.
- A promise that every browser, image codec, and media format is supported.

## 6. MVP scope

Implement a curated first set of small tools that demonstrate several categories and exercise the architecture without requiring massive binaries.

| Tool | Category | Core behavior | Implementation direction |
|---|---|---|---|
| JSON Formatter | Developer | Parse, pretty-print, minify, and report syntax errors with location where available | Native JSON APIs plus focused UI |
| UUID Generator | Developer | Generate UUID v4 values in batches | `crypto.randomUUID()` where available, secure fallback using `crypto.getRandomValues` |
| Password Generator | Other / Developer | Generate passwords from configurable character sets and length | `crypto.getRandomValues`; unbiased sampling; no network or logging |
| Text Diff | Text | Compare two text inputs and display additions/deletions | Mature diff algorithm library only if required; unit-tested output |
| Word Counter | Text | Count words, characters, lines, and optionally estimated reading time | Deterministic TypeScript with documented Unicode/word-boundary behavior |
| Colour Converter | Colour | Convert common colour notations and report normalized values | Small, audited colour utility or tested local implementation |
| Contrast Checker | Colour | Calculate contrast ratio and display WCAG pass/fail labels | Formula tests and accessible status output |
| Unit Converter | Calculator | Convert a curated set of common units | Explicit unit table and dimensional groups; avoid false cross-dimension conversions |
| Base64 / URL Encoder | Developer | Encode/decode text with Unicode-safe handling | Browser APIs and carefully tested UTF-8 semantics |
| QR Generator | Other | Produce a downloadable QR code for supported text payloads | Small maintained QR library; input validation and SVG sanitization on export |
| Image Resize / Compress | Images | Resize raster image and export a browser-supported format | Canvas/OffscreenCanvas where available, feature-detected encoders |

The first release can omit any item that creates a quality or maintenance bottleneck. A smaller set of complete, reliable tools is preferable to a large catalogue of placeholders.

### MVP shell

- Home page with tool search, recently used tools only if stored locally, category browse, and clear empty/search states.
- Category pages and dedicated routes for each tool.
- Consistent tool page layout: title, concise explanation, inputs, output, copy/download actions, limits, and privacy/offline status.
- Responsive layout for desktop and mobile.
- Accessible keyboard navigation and visible focus.
- Local preference storage only for low-risk UI preferences (e.g. theme); no uploaded file persistence.
- A compact “Processing happens in your browser” privacy explanation, with exceptions called out for optional remote downloads.
- Helpful unsupported-browser or unsupported-format states.

## 7. Future scope, sequenced by dependency

### Wave A — lightweight expansion

Cron builder, metadata tag generator, barcode generation, palette generation, colour blindness preview, paper-size reference, time calculator, text scratchpad with explicit local-only persistence, and additional encoders.

### Wave B — local document and image processing

PDF page operations using a browser-compatible PDF library; image conversion and metadata handling; SVG optimization; font inspection; print/zine imposition. Each dependency must be checked for licence, browser compatibility, size, and vulnerability history.

### Wave C — media tools

Audio/video inspection, trimming, GIF generation, frame extraction, subtitle tooling, waveform generation, and local transcription. Start with browser-native APIs where sufficient. Add ffmpeg.wasm or local speech models only when the specific codec/operation requires them. Measure memory and runtime on lower-end devices.

### Wave D — large local engines and workflows

Background removal and other ML-powered tools with opt-in model downloads; typed workflows across compatible tools; progress/cancel controls; optional Rust/WASM kernels for hotspots; potentially a native Rust CLI if there is a demonstrated user need.

## 8. Functional requirements

### Discovery and navigation

- Tool metadata is declared once in a typed registry and drives category lists, search, route metadata where applicable, and capability badges.
- Every published registry entry resolves to a real implementation or is excluded from production navigation.
- Search supports tool name, category, description, aliases, and tags.
- Direct-link routes work after a page refresh in the static production deployment.

### Tool behavior

- All fields have validation and an explicit response for empty or malformed input.
- Long-running work shows progress and/or busy state; cancellation is available where supported.
- Copy/export controls report success/failure using accessible status messages.
- File tools reject unsupported MIME/format combinations with actionable feedback rather than failing silently.
- Output is deterministic for deterministic operations, except tools intentionally involving secure random output.

### Privacy

- No user content is sent to an API in MVP.
- Core runtime has no third-party telemetry by default.
- File operations happen locally; all output downloads are initiated by the user.
- External requests are limited to static application assets and, in future, explicit optional engine/model downloads.

### Reliability

- A malformed tool input must not crash the overall application shell.
- Tool failures should stay scoped to the tool route/component.
- Application updates must not leave the service worker serving incompatible old/new assets; PWA behavior is introduced only after the online release is stable.

## 9. Non-functional requirements

### Performance

- Static shell and route HTML should be available without hydrating every tool on the page.
- Avoid loading tool-specific libraries on unrelated routes.
- Establish and record baseline production metrics before optimization claims: JS transferred on home route, JS transferred on each tool route, LCP/INP/CLS, and tool execution time for representative inputs.
- Heavy tasks must move off the UI thread when measurements or expected input size justify it.
- Use budgets as regression alerts, not absolute promises. Suggested initial budgets: home-route JS ≤ 100 KiB compressed excluding browser cache; each simple tool route should avoid loading unrelated tool code; PRs adding more than 30 KiB compressed to the home route require a bundle report and justification. Revise after measuring the real build.

### Accessibility

- Target WCAG 2.2 AA as the design/test goal, with an explicit checklist rather than a blanket unverified compliance claim.
- Test keyboard-only workflows, screen-reader names/status announcements for critical paths, contrast, zoom/reflow, and reduced motion.

### Browser compatibility

- Define a supported baseline before release (current evergreen Chrome/Edge, Firefox, and Safari versions chosen at project kickoff).
- Feature-detect `crypto.randomUUID`, canvas encoders, `OffscreenCanvas`, worker capabilities, screen/microphone capture, WebAssembly extensions, and file APIs.
- Do not infer codec support solely from file extension or MIME label.

### Security

- Strict dependency lockfile, CI audits, input limits, safe rendering, and no remote eval/script loading.
- No uploaded file is written to browser storage by default.
- Security headers are validated at the deployed URL and in the container; a Cloudflare `_headers` file does not configure an independently run Nginx container.

### Offline readiness (later stage)

- Core route/UI assets can be cached and used after a successful online visit.
- Large tool engines/models are opt-in downloads with size, version, integrity, and storage requirements disclosed before download.
- The application recognizes and reports offline/online status but does not rely on network status alone to infer that every tool works.

## 10. Information architecture

Proposed top-level categories for launch: **Developer**, **Text**, **Colour**, **Images**, and **Other**. Add categories only as populated tools justify them. The broader source taxonomy—Audio & Video, PDF, Typography, Social Media, Print & Production, and niche utilities—can be introduced gradually.

Routes should be stable and descriptive, e.g. `/tools/json-formatter/`, `/tools/contrast-checker/`, and `/category/colour/`. If a route format is changed later, preserve old links through static redirects where feasible.

## 11. Success metrics

No personal or tool-input data should be collected solely to produce analytics metrics. Use build/test metrics and opt-in user feedback instead.

- Reliability: production build and route smoke tests pass; no known critical/high dependency vulnerabilities at release.
- Privacy: network inspection confirms no source-file/text payload leaves the app for MVP tools.
- Quality: every published tool has unit tests and critical browser-flow tests.
- Performance: baseline budgets are measured and regressions are caught in CI or PR review.
- Offline: all advertised offline-ready routes/tools pass manual and automated offline scenarios after cache warmup.
- Usability: gather voluntary feedback without requiring content upload; evaluate search success, missing tools, and confusing controls qualitatively.

## 12. Acceptance criteria for the online MVP

A release is acceptable only when:

1. The site builds as static output and runs on Cloudflare Pages without an application server.
2. Home, category, and individual tool URLs load directly and survive browser refresh.
3. All published MVP tools pass unit and browser tests for main paths and edge cases.
4. Inputs and files remain client-side; no analytics or upload endpoints are present.
5. Keyboard navigation and key accessibility checks pass.
6. Production build reports reveal no accidental inclusion of heavy tools/models on unrelated routes.
7. The tool registry has no broken links or placeholder implementations.
8. Deployment, rollback, local preview, and incident diagnosis steps are documented.
9. The project has a license decision and dependency/asset attribution review before an open-source release.
