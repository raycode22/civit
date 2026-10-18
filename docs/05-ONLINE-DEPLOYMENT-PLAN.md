# Civit --- Online Deployment Plan: Cloudflare Pages + R2

**Status:** Recommended primary online deployment  
**Cost target:** $0 within current free-tier allowances; usage must be monitored because overages can be billable.  
**Scope:** Public online website only. Docker/offline requirements are in `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md`.

## 1. Decision

Deploy Civit's online version to Cloudflare Pages and use the already-configured Cloudflare R2 bucket for large static assets. Do not put application files or user data in R2; it is only a public asset origin. Do not implement backend processing, accounts, analytics, or telemetry for this deployment.

The SvelteKit project uses `@sveltejs/adapter-static`; Cloudflare's SvelteKit documentation confirms that this adapter is compatible with Pages and that the build output should be configured as `build/`. Use `vp build` or `npm run build` (which delegates to `vp build`) after verifying the script locally. Do not use the `.svelte-kit/cloudflare` output path unless the project intentionally migrates from `adapter-static` to the Cloudflare adapter.

Official references:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/r2/buckets/cors/
- https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/

## 2. Architecture

```text
Git repository
    │
    ▼
Cloudflare Pages build (pinned Node + lockfile + Vite+)
    │
    ├── Pages: HTML, CSS, normal JS chunks, small assets, prerendered routes
    │
    └── R2 custom domain: large WASM/FFmpeg/model/public files

Browser
    ├── downloads page/tool assets as needed
    └── processes user data locally; no file/output uploads
```

Use the following placement policy:

| Resource | Online delivery |
|---|---|
| HTML routes, manifest, theme init, app shell | Cloudflare Pages |
| Svelte/SvelteKit application and ordinary npm dependencies | Install from `package-lock.json` during build and bundle into versioned JS/CSS chunks |
| Tool-specific UI/logic | Vite lazy-loaded chunks; load on navigation/tool activation |
| Large FFmpeg/WASM binaries or model files | R2 custom domain; fetch only when the relevant tool needs them |
| Small images/icons/styles/fonts | Pages bundle/static output unless measurements show a better option |
| Third-party browser library loaded at runtime | Only when justified; explicitly allowlist and version-pin the CDN URL |
| User files and conversion outputs | Browser-local memory/filesystem/download APIs only; never R2 |

## 3. Dependency delivery policy

Do not translate "online" into "load every npm package from a CDN at runtime." The default should be **build-time install, production bundle, runtime lazy-load**:

1. Use the repository's lockfile and the verified npm/Vite+ installation workflow.
2. Let Vite tree-shake and split app/tool code. Keep libraries out of the initial route unless the shell needs them.
3. Use R2 for large assets that exceed or should not inflate the Pages bundle.
4. Use a third-party CDN only if it materially improves caching, transfer size, compatibility, or maintenance compared with bundling or R2. Pin an immutable version URL, record the licence, and define a fallback/error state for its failure.
5. Avoid an unbounded `latest` URL or runtime package-manager behavior. Never load code from a user-controlled URL.
6. Do not upload or process user-selected files remotely. Public asset requests are allowed; user content and telemetry are not.

## 4. Build configuration

Configure the Pages project against the repository root (unless a monorepo root is later introduced):

| Setting | Value |
|---|---|
| Production branch | The chosen release branch (use `main` only if that is the repository's actual production branch) |
| Build command | `vp build` or `npm run build`, verified against package scripts |
| Build output directory | `build` |
| Node.js | Pin the version verified by repository CI/project metadata; do not accept a silent major-version change |
| Asset profile | `online` |
| Online asset base | The HTTPS custom domain attached to the existing R2 bucket |

Use a central asset resolver or build-time configuration rather than scattering the R2 domain throughout tool code. The online build must embed only the online asset base. The Docker build must use local paths and must never reuse an online build output without validation.

If the repo uses `PUBLIC_*` environment variables for public asset URLs, remember these are compiled into client-side output and are not secrets. Never put credentials, R2 API tokens, or private bucket credentials in a public build variable.

## 5. R2 configuration and operating rules

1. Use a production custom domain such as `assets.example.com` attached to the R2 bucket. Cloudflare documents `r2.dev` as a non-production/testing endpoint; do not use it for production traffic.
2. Keep only intended public immutable assets in the public bucket. Never expose user files, private model data, secrets, build logs, or the source repository by accident.
3. Use a versioned prefix such as `/civit/<release-or-asset-version>/...`, or content-hashed object names. Do not overwrite long-cached filenames with new bytes.
4. Serve accurate MIME types for JavaScript modules, WASM, fonts, JSON and model files. Test the actual browser fetch rather than assuming that a successful object upload proves it will execute.
5. Apply long-lived `Cache-Control: public, max-age=31536000, immutable` only to versioned/content-hashed immutable objects. Give mutable manifests/configuration short cache lifetimes or an explicit revalidation policy.
6. Set R2 CORS to the exact production Pages origin and any intentional preview origin that needs direct browser access. Permit only required methods (normally `GET` and `HEAD`) and headers. Do not use wildcard origins unnecessarily. Purge relevant Cloudflare cache after changing a CORS policy because already-cached responses may not immediately contain updated CORS headers.
7. Test large-object range requests if a selected tool or library requires them. Test cross-origin fonts, ES modules, and WASM with the actual response headers.
8. Keep public bucket listing disabled by design; reference exact known object keys in code/asset manifests rather than expecting directory listing.

## 6. Free-tier and cost controls

Cloudflare's current official R2 pricing page lists the Standard free allowance as 10 GB-month storage, 1 million Class A operations/month, 10 million Class B operations/month, and free internet egress. Cloudflare Pages Free currently permits up to 20,000 files and has a 25 MiB maximum per Pages asset. Verify these numbers in the Cloudflare dashboard/docs before launch because provider terms can change.

Cost-control rules:

- Use Pages for the application and small assets; use R2 for large assets.
- Do not proxy every small request through a Worker or add a backend without a demonstrated need.
- Cache immutable R2 assets at the custom domain and avoid repeated manifest/object-discovery requests.
- Lazy-load large assets and share one versioned FFmpeg core between tools where the architecture supports it.
- Use compression where appropriate and avoid shipping development/test artifacts, source maps, fixtures, or duplicate bundles to production.
- Review Pages file count, Pages build usage, R2 storage, and R2 operation counts before release and during usage growth. Free egress does not mean unlimited free storage or request operations.
- Keep a conservative budget. If the account's billing settings allow it, configure usage notifications; do not assume a hard spending cap exists unless it is verified in the dashboard.

## 7. Headers, CORS, caching and security

- Validate `build/_headers` is present and that the headers Pages actually returns match the requirements of the selected tools.
- Apply COOP/COEP only if the chosen multi-threaded WASM build needs cross-origin isolation. Verify this on Pages, not merely by inspecting the header file.
- Ensure any cross-origin-isolated deployment remains compatible with Workers, pop-outs, embeds, and browser APIs in the app.
- Keep a Content Security Policy where feasible, including `script-src`, `connect-src`, `font-src`, `worker-src`, and `img-src` entries for the Pages origin, R2 custom domain and deliberately approved CDN origins. Start with observed requirements and test in report-only mode before enforcement.
- Do not allow the online origin allowlist to become a policy that permits sending user files to those origins. Allowed asset hosts are for public code/assets only.

## 8. Deployment workflow

1. Verify the current working tree and exact branch; deploy only a reviewed commit.
2. Ensure the lockfile is committed and the Node/Vite+ versions meet project requirements.
3. Run `vp check`, `vp test run`, `vp build`, and Playwright smoke tests where available.
4. Inspect `build/`: expected routes, `_headers`, PWA/static files, asset references, no development artifacts, and no broken relative paths.
5. Upload the online-only large asset set to R2 using a repeatable manifest or script. Record object keys, versions, content types, checksums and cache headers. This upload step must not place credentials in Git or the built site.
6. Deploy `build/` to Pages.
7. Test the live site: root, direct routes, reload, search/filter, theme, Base64 encoder, largest R2 asset, tool lazy loading, console/network errors, and privacy behavior.
8. Confirm usage is within the current free-tier allowances before announcing release.

## 9. Acceptance checklist

- [ ] Pages builds the current static output using the verified command and `build/` output path.
- [ ] Direct navigation and reload work for all prerendered `/tools/<id>` routes.
- [ ] Online app assets are served from Pages and only the configured R2/CDN allowlist.
- [ ] Large assets are delivered from the R2 custom domain, not `r2.dev`.
- [ ] CORS/MIME/cache headers work for modules, fonts and WASM.
- [ ] Only required tool chunks/assets are fetched when a tool opens.
- [ ] No files, recordings, selections, or outputs are uploaded; no telemetry/analytics requests occur.
- [ ] The site's privacy notice reflects asset-provider request metadata without implying user-content uploads.
- [ ] Pages file-size and file-count limits are respected; R2 usage is within the free allowance or explicitly accepted.
- [ ] Online deployment verification is recorded separately from Docker/offline verification.
