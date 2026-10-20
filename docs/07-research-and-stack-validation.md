# Civit Research and Stack Validation

**Review date:** 19 October 2026  
**Source material:** user-provided `Pasted text.txt` (Delphi.tools analysis); current official documentation and selected implementation/community sources linked below.  
**Purpose:** distinguish source-derived product ideas from verified platform constraints and architectural recommendations.

## 1. Executive decision

The proposed direction—Astro for mostly static pages, Svelte 5 for interactive tools, TypeScript for ordinary tool logic, browser-native APIs/Web Workers for local processing, and a later PWA/Docker stage—is viable. The plan should be revised in five important ways:

1. **Do not treat every tool as a Rust/WASM problem.** Start with TypeScript and web APIs; add Rust/WASM to specific hotspots only after measuring performance or establishing a real shared CLI requirement.
2. **Do not cache every model through Workbox precache.** Cloudflare Pages currently has a 25 MiB per-file limit. A roughly 110 MB model cannot be deployed as a single Pages asset. Use an R2 custom domain or an explicit alternate asset distribution path, then make the download opt-in and versioned.
3. **Do not enable COOP/COEP globally at the start.** They are required for `SharedArrayBuffer` in supported browsers and are relevant to multi-threaded WASM, but can cause cross-origin resource failures. First ship single-threaded/baseline functionality and add isolation only when a feature needs it.
4. **Do not claim complete offline behavior from a service worker alone.** Browser storage is quota-limited and may be evicted or cleared. Offline readiness is per tool and per engine, must be represented in UI, and must be tested with network disabled.
5. **Avoid overengineering the repository before there are independent packages.** Use pnpm and one app initially; add Turborepo, shared Rust crates, and CLI targets when product scope makes them valuable.

The requested Cloudflare Pages target is appropriate for the static MVP. Cloudflare’s current Astro guide recommends Workers for new projects generally, especially where runtime behavior is needed. Because Civit’s first release needs no runtime, Pages remains a workable choice; isolate platform-specific config so migration is possible.

## 2. What was taken from the supplied research

The supplied text provides the product direction and proposed tool taxonomy:

- local-first processing and privacy as the main differentiator;
- a consolidated library of small utilities grouped by category;
- incremental support for images, text, colour, developer tools, PDFs, media, calculators, and niche tasks;
- an Astro + Svelte 5 proposal, Tailwind CSS v4, Bits UI, worker offloading, optional Rust/WASM, Workbox-based PWA, Cloudflare Pages, and Docker packaging.

These are useful requirements and hypotheses, not independent proof that the existing Delphi.tools implementation currently uses every described dependency/version or that every listed tool is available. Civit should implement its own scope and validate each feature from scratch. The original tool count and dependency claims are not repeated here as verified current facts.

## 3. Stack-by-stack review

### Astro static site + Svelte 5 — **Keep**

Astro’s official docs describe file-based routes and static prerendering, and its Svelte integration supports Svelte 5 components with client hydration directives. This fits a toolbox where navigation and tool descriptions can be static but the active tool needs interaction.

Important qualification: “zero JavaScript by default” describes non-hydrated Astro output, not a guarantee that the whole application ships zero JS or that every component bundle is a fixed size. Route-level imports and production bundle measurement are still required.

Sources:
- Astro pages and routing: <https://docs.astro.build/en/basics/astro-pages/> and <https://docs.astro.build/en/guides/routing/>
- Astro client directives: <https://docs.astro.build/en/reference/directives-reference/>
- Official Svelte integration: <https://docs.astro.build/en/guides/integrations-guide/svelte/>
- Svelte runes: <https://svelte.dev/docs/svelte/what-are-runes>

### Tailwind CSS v4 — **Keep**

The current official Tailwind Astro guide installs `tailwindcss` with `@tailwindcss/vite`, configures that Vite plugin in Astro, and imports Tailwind in CSS. Use that current integration path, rather than mixing in older Tailwind v3 instructions or an out-of-date framework-specific adapter.

Source: <https://tailwindcss.com/docs/installation/framework-guides/astro>

### Bits UI — **Keep selectively**

Bits UI is a headless component library for Svelte 5 with accessibility-oriented components, keyboard navigation, and focus management. It can accelerate dialogs, popovers, menus, and similar controls, but its presence does not certify Civit as accessible. Use components only where needed and run app-level keyboard/screen-reader tests.

Source: <https://bits-ui.com/docs/introduction>

### pnpm + Turborepo — **pnpm now, Turborepo later**

The supplied research proposes a pnpm monorepo and Turborepo. pnpm is reasonable immediately; a task orchestrator is optional when there is only one app package. Start with normal pnpm scripts. Once there are separate web, WASM, shared-core, CLI, and/or docs packages with independent caches/builds, introduce a workspace and evaluate Turbo based on build times and task graph complexity.

Source: <https://pnpm.io/workspaces> and <https://pnpm.io/catalogs>

### Web Workers and Comlink — **Keep the principle; defer the wrapper**

Offloading expensive work is sound. Native Web Workers already provide the necessary isolation boundary, and a typed message protocol may be enough initially. Comlink can make RPC-like calls more convenient but adds a dependency and abstraction to maintain. Adopt it only when it reduces complexity across multiple worker consumers. No worker architecture can guarantee 60 FPS under all hardware and workload conditions; measure long tasks and responsiveness.

Source: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers>

### Rust/WASM shared core — **Defer and narrow**

Rust may be valuable for deterministic low-level algorithms, a future CLI, or proven compute bottlenecks. It is not a universal browser solution. Browser file access, DOM/canvas work, Web Crypto, and many APIs naturally belong in TypeScript adapters. Rust crates that rely on filesystem/network I/O or native threads may not transfer cleanly to `wasm32-unknown-unknown`; the Rust/WASM book explains factoring I/O out of shared crates and testing the WASM target, though the book notes that the project is no longer actively maintained.

A “shared source tree” does not mean absolute behavior parity automatically: platform I/O, errors, floating point, dependency features, and adapters can diverge. Build test suites for both targets if Rust is introduced.

Source: <https://rustwasm.github.io/docs/book/reference/add-wasm-support-to-crate.html>

### Cloudflare Pages — **Keep for the static MVP, correct the hosting assumptions**

Cloudflare Pages supports static deployment and a `_headers` file for headers on static responses. Current documentation has an individual asset maximum of 25 MiB and a Free-plan file count limit of 20,000 (verify current plan limits before deployment). Therefore, large model files do not belong in Pages output. The “unmetered bandwidth/flat costs regardless of traffic” assertion in the supplied research is too categorical; review current account pricing/quotas and avoid cost promises in product docs.

Cloudflare’s current Astro deployment docs recommend Workers for new projects generally. That recommendation is most significant if the site needs server-rendering or APIs. For Civit’s static-only first release, Pages remains a practical path, with a future re-evaluation gate.

Sources:
- Pages limits: <https://developers.cloudflare.com/pages/platform/limits/>
- Pages headers: <https://developers.cloudflare.com/pages/configuration/headers/>
- Astro deploy to Cloudflare: <https://docs.astro.build/en/guides/deploy/cloudflare/>
- Static Pages deployment: <https://developers.cloudflare.com/pages/framework-guides/deploy-anything/>

### R2 for large assets — **Add to the architecture**

Cloudflare’s R2 public-bucket documentation explains serving assets through a custom domain and notes that production custom-domain setups unlock Cloudflare caching/security features not available through the development `r2.dev` URL. R2 should host immutable, public model/engine binaries only when their licenses permit public distribution. Set CORS narrowly and test browser access; this is not a place to store user-generated files.

Sources:
- <https://developers.cloudflare.com/r2/buckets/public-buckets/>
- <https://developers.cloudflare.com/r2/buckets/cors/>

### PWA + Workbox + `@vite-pwa/astro` — **Keep, but implement after online stability**

The Astro PWA integration exists and has a documented repository; verify the exact current release/version compatibility at implementation time. Workbox precache file-size limits are separate from Cloudflare’s deployment limits. Increasing a precache threshold can cause giant bundles to be precached, but it cannot make Pages accept an oversized asset. The correct design is a small core precache plus explicit runtime/model downloads.

The sample `navigateFallback: '/404.html'` configuration in the supplied research should not be adopted blindly. Civit is a multi-page statically generated site: cached exact route pages should continue to work, unknown paths should remain 404 online, and a specific offline fallback should handle only navigation that cannot be served while offline.

Sources:
- <https://github.com/vite-pwa/astro>
- <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation>
- <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>
- <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching>

### COOP/COEP and multi-threaded WASM — **Conditional, not default**

MDN documents that features such as `SharedArrayBuffer` require cross-origin isolation in supported browsers. That commonly requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` or `credentialless`, along with compatible resource policies. These headers can block resources that have not been configured for CORS/CORP and can alter opener behavior. Do not enable them unless a feature uses shared memory/multi-threaded WASM and the impact is tested.

FFmpeg WASM’s project docs distinguish single-thread and multi-thread builds and note the latter’s `SharedArrayBuffer`/cross-origin-isolation dependency. Community reports about ffmpeg.wasm have also documented real-world problems around thread builds and resource behavior; those reports are not universal evidence of current package quality, but reinforce testing the exact build rather than assuming the multi-threaded variant always wins.

Sources:
- MDN COEP: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy>
- MDN cross-origin isolation: <https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated>
- ffmpeg.wasm project docs: <https://github.com/ffmpegwasm/ffmpeg.wasm>
- Substantive community/issue discussion: <https://github.com/ffmpegwasm/ffmpeg.wasm/issues/285>

### Browser storage and offline — **Add quota, eviction, and recovery handling**

The Cache API is persistent but browser-dependent. The application is responsible for versioning, deleting stale cache entries, and handling quota. `navigator.storage.estimate()` reports approximate usage/quota, not a guaranteed reservation. Browser storage can be evicted, especially under storage pressure, and users can clear site data. Hence cache status is a runtime fact and offline readiness must be recoverable rather than promised permanently.

Sources:
- <https://developer.mozilla.org/en-US/docs/Web/API/Cache>
- <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>
- <https://developer.mozilla.org/en-US/docs/Web/API/StorageManager>

### Docker — **Keep, but implement as a static runtime**

A multi-stage Docker build is appropriate: build with Node/pnpm, then copy the static output into a small Nginx runtime image. Build and runtime concerns should be separated. The Docker image needs its own Nginx header and routing configuration; Cloudflare’s `_headers` file does not control an arbitrary Nginx server. Prefer a non-root image/user and restrict network exposure in default commands.

Sources:
- Docker multi-stage builds: <https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/>
- Docker engine security: <https://docs.docker.com/engine/security/>
- Rootless mode: <https://docs.docker.com/engine/security/rootless/>

## 4. Critical corrections to the supplied analysis

| Supplied assumption or proposed detail | Revised implementation decision |
|---|---|
| A ~110 MB ISNet model can be cached via a 50 MB Workbox precache threshold on Pages | The file exceeds the 25 MiB Pages per-file limit. Host it separately (e.g. R2) and download/cache on demand, or include it only in a separate Docker offline bundle. |
| COOP/COEP can be added globally as a generic optimization | Only enable if a selected engine requires shared memory/cross-origin isolation; test all same- and cross-origin assets. |
| All utility compute should share a Rust/WASM core | TypeScript/browser APIs by default; selective Rust kernels when data shows value or CLI sharing is an actual requirement. |
| Turborepo provides sub-second builds/halves maintenance | No performance guarantee. Add it only after there are independent workspace packages and observed build bottlenecks. |
| Svelte islands are always 3–10 KB and improve evaluation by a fixed amount | Bundle size/performance depend on component/dependency graph and hydration mode; measure actual route bundles and user-centric metrics. |
| Workers guarantee 60 FPS | Workers can protect the UI thread from compute, but transfer costs, memory pressure, browser scheduling, and rendering still affect responsiveness. Test representative devices. |
| PWA cache guarantees complete offline usage | Only cached routes/assets work offline, and browser storage may be evicted. Make readiness per-tool and test recovery. |
| Static hosting cost is completely flat regardless of traffic | Avoid the claim. Limits, plan features, large asset delivery, build usage, requests, and pricing can change; review current terms and monitor usage. |
| Delphi’s taxonomy/implementation claims should be taken as a verified acceptance checklist | Treat them as product inspiration. Validate current source/license/tool availability independently; build a smaller, tested MVP first. |

## 5. Recommended phased stack

### Online MVP

- Astro static output
- Svelte 5 for interactive tool islands
- TypeScript strict mode
- pnpm lockfile
- Tailwind CSS v4 through `@tailwindcss/vite`
- Bits UI selectively
- Vitest + Playwright
- Cloudflare Pages with `_headers`
- No server adapter, no Functions, no database, no telemetry SDK

### PWA

- Add `@vite-pwa/astro`/Workbox after the site is stable
- Manifest + small precache + exact-route offline behavior
- Optional downloads from R2 for large versioned model/engine assets
- Cache Storage with quota/eviction/update handling

### Docker

- Multi-stage Node build + unprivileged Nginx static runtime
- Docker-specific routing, MIME and header configuration
- Separate optional offline-model image/build mode

### Optional future extensions

- Native workers first, Comlink if it simplifies repeated worker RPC
- Rust/WASM for measured hotspots/shared algorithms, with target CI
- pnpm workspace/Turborepo only when monorepo complexity exists
- FFmpeg/PDF/ONNX and ML models after compatibility, licence, bundle, and memory validation

## 6. Risks to verify at implementation time

Package APIs, release cadence, browser support, Cloudflare limits/pricing, model hosting terms, and native codec behavior can change. Before implementation, refresh the official documentation linked above, then record chosen package versions in the lockfile. The docs here define architecture and gates; they are not substitutes for running the build, testing the deployment, and validating the target browser matrix.
