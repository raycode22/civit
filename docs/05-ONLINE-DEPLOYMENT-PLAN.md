# Civit --- Online Deployment Plan: Cloudflare Pages + Hugging Face (models)

**Status:** Recommended primary online deployment; decisions of 2026-10-19 applied  
**Cost target:** $0 within current free-tier allowances; usage must be monitored because overages can be billable. A billing alert already exists on the Cloudflare account.  
**Scope:** Public online website only. Docker/offline requirements are in `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md`; decisions are logged in `04-OFFLINE-FIRST-DECISIONS.md`.

## 1. Decision

Deploy Civit's online version to Cloudflare Pages. Bundle everything that can be bundled. Keep every Pages file under the 25 MiB per-file limit. Load ML model files from Hugging Face Hub. R2 is deferred: do not serve large assets from R2 or from the r2.dev URL for now. Do not implement backend processing, accounts, analytics, or telemetry for this deployment.

The SvelteKit project uses `@sveltejs/adapter-static`; Cloudflare's SvelteKit documentation confirms that this adapter is compatible with Pages and that the build output should be configured as `build/`. Use `vp build` or `npm run build` (which delegates to `vp build`) after verifying the script locally. Do not use the `.svelte-kit/cloudflare` output path unless the project intentionally migrates from `adapter-static` to the Cloudflare adapter.

Official references (check again before deployment; limits can change):
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://huggingface.co/docs/hub/rate-limits
- https://huggingface.co/docs/hub/storage-limits
- https://huggingface.co/docs/transformers.js/main/en/api/env

## 2. Architecture

```text
Git repository (GitHub)
    │
    ▼
Cloudflare Pages build (pinned Node + lockfile + Vite+)
    │
    └── Pages: HTML, CSS, fonts, JS chunks, WASM (split if > 25 MiB), prerendered routes

Browser
    ├── downloads page/tool assets from Pages as needed
    ├── downloads ML model files from Hugging Face Hub only when an ML tool is opened
    └── processes user data locally; no file/output uploads
```

| Resource | Online delivery |
|---|---|
| HTML routes, manifest, theme init, app shell | Cloudflare Pages |
| Svelte/SvelteKit application, npm dependencies, fonts, CSS | Installed from `package-lock.json` at build time and bundled into versioned files on Pages |
| Tool-specific UI/logic | Vite lazy-loaded chunks; load on navigation/tool activation |
| ffmpeg single-thread core | Pages, split into pieces under 25 MiB if the real core exceeds the cap; the browser joins them before loading |
| ML model files | Hugging Face Hub (approved repository and version per model) |
| User files and conversion outputs | Browser-local memory/filesystem/download APIs only; never uploaded |

## 3. Dependency delivery policy

1. Use the repository's lockfile and the verified npm/Vite+ installation workflow.
2. Let Vite tree-shake and split app/tool code. Keep libraries out of the initial route unless the shell needs them.
3. Do not load fonts, CSS or JS libraries from runtime CDNs. Bundle them.
4. The only approved third-party runtime origin is Hugging Face Hub, for ML model files. Pin the repository and revision, record the licence, and define a clear error state for download failure.
5. Never load code from a user-controlled URL. Avoid unbounded `latest` references.
6. Do not upload or process user-selected files remotely. Public asset requests are allowed; user content and telemetry are not.
7. Never place a Hugging Face token (or any credential) in the browser bundle. Anonymous access is sufficient.

## 4. Build configuration

Configure the Pages project against the repository root (unless a monorepo root is later introduced):

| Setting | Value |
|---|---|
| Production branch | The chosen release branch (use `main` only if that is the repository's actual production branch) |
| Build command | `vp build` or `npm run build`, verified against package scripts |
| Build output directory | `build` |
| Node.js | Pin the version verified by repository CI/project metadata; do not accept a silent major-version change |
| Asset profile | `online` |
| Model origin | Hugging Face Hub, through the central asset resolver |

Use a central asset resolver or build-time configuration rather than scattering model URLs through tool code. The online build embeds only the online asset settings. The Docker build uses local paths and never reuses an online build output without validation. Public build variables are compiled into client-side output and are not secrets.

## 5. Large files and models

### 5.1 ffmpeg core (Phase C)

- Use the single-thread core (decision D-14). Multi-threading needs a new owner decision and COOP/COEP verification.
- Measure the real core size before deciding anything. The earlier figure (about 30 MB raw) is an estimate.
- If any file exceeds 25 MiB, split it into pieces below the cap and add a loader that fetches the pieces and joins them before WebAssembly instantiation. Test the loader in the built site early.
- Check whether Pages' cap applies to the raw file or the compressed one; split in either case unless measured otherwise.

### 5.2 ML models (Phase D)

- Load models from approved Hugging Face repositories. The transformers.js `env.remoteHost` setting controls the model host, so a mirror (for example R2 later) can be swapped in without changing tool code. Browser caching through the Cache API is on by default in transformers.js, so repeat visits do not re-download.
- Anonymous downloads are rate limited per IP address (documented as 3,000 file-download requests per 5-minute window at the time of writing; subject to change). A model load is a handful of files, so a few simultaneous visitors, even behind one shared IP, stay far below the limit.
- Hugging Face is a free third-party service with no uptime promise, and the free-plan bandwidth terms are not stated explicitly on its pricing page. For interviews and demos, keep the Docker image as the reliable fallback and warm the browser cache beforehand.
- Request metadata (IP address, user agent) reaches Hugging Face when a model downloads. State this in the privacy notice. No user content is sent.
- Each model needs owner approval (licence, size) before it is referenced (FR-33, FR-41).

### 5.3 R2 (deferred)

R2 is not used for now. If adopted later: the custom domain must be a zone in the same Cloudflare account (a subdomain of a domain you do not control, such as an is-a.dev subdomain, is likely not eligible; verify), r2.dev is rate limited and not for production, CORS must name the exact Pages origin, and versioned objects need immutable cache headers. Record any such change as a new decision in `04-OFFLINE-FIRST-DECISIONS.md`.

## 6. Free-tier and cost controls

Cloudflare Pages Free currently permits up to 20,000 files, a 25 MiB maximum per asset, and 500 builds per month. Verify these in the Cloudflare dashboard before launch because provider terms can change.

Cost-control rules:

- Use Pages for the application and all small assets.
- Do not proxy requests through a Worker or add a backend without a demonstrated need.
- Lazy-load heavy assets and share one versioned ffmpeg core between tools.
- Use precompression for static text and WASM assets where the host allows it, and avoid shipping source maps, fixtures, duplicate bundles or development artifacts.
- Review Pages file count and build usage before release and during usage growth.
- Keep the existing billing alert in place. Do not assume a hard spending cap exists unless it is verified in the dashboard.

## 7. Headers, caching and security

- Validate `build/_headers` is present and that the headers Pages actually returns match the requirements of the selected tools.
- The single-thread ffmpeg core does not need COOP/COEP. Add these headers only if a later decision selects multi-threading, and verify them on Pages itself.
- Keep a Content Security Policy where feasible, including `script-src`, `connect-src`, `font-src`, `worker-src`, and `img-src` entries for the Pages origin and the Hugging Face model origin. Observe which hosts Hugging Face downloads actually use (including any redirect host) in a real network trace before enforcing, and start in report-only mode.
- The allowed model host is for public model files only. Never send user files to it.

## 8. Deployment workflow

1. Verify the current working tree and exact branch; deploy only a reviewed commit.
2. Ensure the lockfile is committed and the Node/Vite+ versions meet project requirements.
3. Run `vp check`, `vp test run`, `vp build`, and Playwright smoke tests where available.
4. Inspect `build/`: expected routes, `_headers`, static files, asset references, no development artifacts, no file over 25 MiB, and no broken relative paths.
5. Deploy `build/` to Pages.
6. Test the live site: root, direct routes, reload, search/filter, theme, Base64 encoder, the split ffmpeg core (when present), a model download from Hugging Face (when present), tool lazy loading, console/network errors, and privacy behavior.
7. Confirm usage is within the current free-tier allowances before announcing the release.

## 9. Acceptance checklist

- [ ] Pages builds the current static output using the verified command and `build/` output path.
- [ ] Direct navigation and reload work for all prerendered `/tools/<id>` routes.
- [ ] Every online file is under Pages' 25 MiB per-file limit; a split ffmpeg core, if needed, joins and loads correctly.
- [ ] Online network requests go only to Pages and, for ML model files, Hugging Face Hub.
- [ ] No fonts, CSS or JS libraries load from a runtime CDN.
- [ ] Only required tool chunks/assets are fetched when a tool opens.
- [ ] Model downloads succeed, are cached by the browser, and fail with a clear error state when Hugging Face is unreachable.
- [ ] No files, recordings, selections, or outputs are uploaded; no telemetry/analytics requests occur.
- [ ] The privacy notice reflects asset-provider request metadata (Pages and Hugging Face) without implying user-content uploads.
- [ ] Pages file-count and file-size limits are respected.
- [ ] Online deployment verification is recorded separately from Docker/offline verification.
