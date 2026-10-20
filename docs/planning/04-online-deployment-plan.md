# Civit Online Deployment Plan — Cloudflare Pages

**Target:** static production site, no backend runtime  
**Build output:** `dist/`  
**Required services:** Git provider + Cloudflare Pages  
**Large binary/model hosting:** Cloudflare R2 or another static object host; not Pages asset output

## 1. Deployment strategy

Use Cloudflare Pages for the first online release because the MVP is statically generated and does not need a server. Astro’s default static output should generate HTML, JS, CSS, icons, and small assets. Do not install the Cloudflare SSR adapter or add Functions during the MVP.

Cloudflare’s current Astro deployment guidance recommends Cloudflare Workers for new projects in general. That is relevant if Civit later needs server-side rendering, APIs, or Worker bindings. It does not prevent a static Pages deployment. Keep the application host-agnostic and re-evaluate this decision when server capabilities become a real requirement.

## 2. Required repository setup

- Commit `pnpm-lock.yaml`.
- Pin the Node and pnpm versions used in CI. Select a currently supported Node LTS compatible with the installed Astro major at kickoff; do not let developer and CI environments silently diverge.
- Have `pnpm build` emit to `dist/`.
- Keep public static files in `public/`, including `public/_headers`.
- Ensure static route HTML is emitted for the home page, category pages, tool pages, and `404.html`.
- Keep secrets out of front-end environment variables. A purely static application should not need secrets in its build environment.

Suggested `package.json` script contract (adapt commands to the selected lint/typecheck setup):

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Install the packages and script integrations according to the current official Astro/Svelte/Tailwind documentation rather than copying a version number from an old tutorial. If `astro check` is used, install its required checker dependencies.

## 3. Cloudflare Pages project settings

For a Git-connected Pages project, configure the production branch and build settings as follows:

| Setting | Value |
|---|---|
| Production branch | `main` (or the repository’s chosen release branch) |
| Build command | `pnpm install --frozen-lockfile && pnpm build` if the build environment supports pnpm via Corepack; otherwise enable pnpm explicitly and use the same pinned version |
| Build output directory | `dist` |
| Root directory | repository root unless the project later becomes a workspace with a dedicated app directory |
| Functions | none for the static MVP |
| Environment variables | only non-secret public build settings, if needed |

Verify the current Pages build image/runtime documentation before enabling the first build. Do not assume the newest Node major is already the project default.

## 4. Hard asset-size constraint

Cloudflare Pages currently limits an individual deployed site asset to **25 MiB**. Pages also has a maximum file count, so a large tool suite must track both file size and file count as it grows. This is a hard deployment constraint, not a Workbox setting.

Consequences:

- Do not put a ~110 MB ONNX model, large FFmpeg core, or another >25 MiB indivisible file in `dist/`.
- Increasing Workbox’s `maximumFileSizeToCacheInBytes` does not change Cloudflare’s upload/deploy limit.
- Do not split a model into arbitrary files solely to evade a host limit unless the model/runtime formally supports chunked loading and the design has been tested end-to-end.
- Put large, versioned engine/model binaries in an R2 bucket attached to a production custom domain, or choose another binary distribution route.
- Keep the online MVP build small enough that normal Pages deployment and preview environments remain practical.

## 5. Large asset delivery through R2

Use a dedicated hostname such as `assets.civit.example` after the real domain is selected. Treat this as a placeholder in docs, not as an acquired domain.

For each asset:

1. Give it a versioned or content-hashed name (for example `models/foreground-v1/<hash>.onnx`).
2. Store the asset license and provenance with the release record.
3. Configure an R2 custom domain for production, rather than treating the rate-limited `r2.dev` development URL as the production origin.
4. Configure CORS for the app’s production and preview origins that genuinely need access; do not use a wildcard credentialed policy.
5. Set suitable `Content-Type` and immutable cache headers. For cross-origin isolation, verify `Cross-Origin-Resource-Policy`/CORS as applicable to the chosen engine and COEP policy.
6. Test fetch, streaming/download, CORS, offline caching, and checksum/integrity verification in the production browser context.
7. Do not store user uploads or tool outputs in the public bucket.

A large engine may be delivered from R2 while the app itself remains a static Pages site. Be explicit that an initial download requires internet and that browser cache persistence is not guaranteed.

## 6. Security headers

A starter `public/_headers` file can use the following baseline. Validate it after deployment and review it again when screen/microphone capture, cross-origin engines, or other capabilities are introduced.

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

Notes:

- Confirm actual asset paths in the built `dist/`; if Astro’s generated path differs, adjust the rule.
- Do not apply long-lived `immutable` caching to the HTML shell. HTML should revalidate so releases can update users.
- Do not add a strict Content Security Policy without testing Astro’s generated scripts/styles and any future worker/WASM needs. Write the policy from the actual dependency/resource graph, not from a generic copy/paste.
- Do not add COOP/COEP by default. Add those headers only when a feature needs `SharedArrayBuffer`/cross-origin isolation, and only after testing external R2 resources and all third-party origins.
- Cloudflare’s `_headers` file applies to static asset responses; it does not configure Pages Functions responses. That limitation is immaterial while the app has no Functions.

## 7. CI/CD workflow

### Pull request

1. Install from the lockfile.
2. Run formatting/lint, type checks, unit tests, and production build.
3. Validate the tool registry and routes.
4. Run relevant Playwright tests.
5. Scan dependencies and repository for secrets.
6. Report route bundle changes for significant dependency or global-shell changes.
7. Review the preview deployment, including direct links and error pages.

### Merge to production branch

1. Cloudflare Pages builds from the pinned toolchain.
2. Confirm deployment is healthy.
3. Run smoke tests against the deployed production URL:
   - `/` returns the expected page;
   - each MVP route loads directly and survives refresh;
   - CSS/JS/WASM MIME types are correct;
   - required response headers are present;
   - no unexpected calls to file-upload/analytics endpoints occur;
   - console has no fatal errors.
4. If tests fail, revert the release commit and redeploy the previous known-good build.

Avoid deployment scripts that mutate production DNS, R2 CORS, or global headers without explicit review.

## 8. Domain and release process

1. Create the Pages project from the canonical Git repository.
2. Verify the automatic preview deployment.
3. Attach the production domain after DNS and ownership checks.
4. Keep a `staging` environment/domain for testing PWA, headers, model downloads, and future cross-origin isolation.
5. Set production cache rules and R2 CORS separately from staging.
6. Test the final canonical URL. Service workers, PWA installability, storage, CORS, and cross-origin isolation behave by origin, so a preview deployment is not a substitute for production-domain verification.

## 9. Operational checklist

Before every release:

- [ ] Lockfile install and tests pass.
- [ ] `dist/` contains no secret, source fixture, unlicensed file, or unintended model.
- [ ] No asset exceeds the Pages per-file maximum.
- [ ] File count is comfortably below the current Pages project cap.
- [ ] All registry routes work when loaded directly.
- [ ] No unintentional upload/telemetry network request is present.
- [ ] Response headers and cache behavior are correct.
- [ ] R2 assets, if used, have pinned version/hash names, CORS, MIME, licence records, and integrity checks.
- [ ] Preview and rollback procedures are known to the person deploying.

## 10. Current limitations to communicate

- Static hosting does not perform server-side jobs or protect secrets placed in the browser bundle.
- R2-hosted large binaries require an initial download for first use and can be removed by browser storage cleanup.
- Free-tier features and quotas can change; verify the actual Cloudflare account plan before budgeting a production release.
- If server-side APIs, authenticated access, or runtime-generated responses are introduced, redo the hosting decision instead of quietly adding Pages Functions without architectural review.
