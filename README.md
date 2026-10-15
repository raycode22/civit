# Civit

Civit is an offline-first, self-hostable collection of browser-based utilities. It is built with SvelteKit, Svelte 5, Vite+ and Tailwind CSS. The current initial tool is the **Base64 Image Encoder**. Additional converters and utilities should be added through the project's tool registry and documented implementation plan.

Civit is designed to process supported inputs in the browser. After the app's service worker has installed and cached the required assets, supported features should remain usable offline. Offline runtime after setup is different from an air-gapped installation: dependency installation and the initial build still require the required packages and base images to be available locally.

## Requirements

Use a Node.js release accepted by `package.json`:

- Node.js `22.18.0` or newer within the 22.x line; or
- Node.js `24.11.0` or newer within the 24.x line; or
- Node.js `26.0.0` or newer.

Use the npm version bundled with the selected Node.js release unless project maintainers document otherwise. The repository pins its direct dependencies and uses `package-lock.json`; use `npm ci` rather than `npm install` for reproducible dependency installation.

## Local development

```sh
npm ci
npm run sync
npm run dev
```

Open the local URL printed by the development server.

## Quality checks

Run these before opening a pull request:

```sh
npm run check
npm run test
npm run build
```

The `check` script runs Vite+ checks and `svelte-check`. The `test` script runs the unit tests. `build` creates the static production output in `build/`.

To run browser end-to-end tests, install the Playwright Chromium browser once and then run the suite:

```sh
npx playwright install chromium
npm run test:e2e
```

On Linux machines missing browser system libraries, Playwright may report additional OS package requirements. Install those using the platform's supported package manager; do not treat a skipped or blocked browser run as a passing test.

To preview a production build locally:

```sh
npm run build
npm run preview
```

## PWA and offline use

1. Open the deployed site while online using HTTPS, or run it on `localhost`.
2. Allow the service worker to install and activate. Keep the app open long enough for required assets to be cached; reload once if needed.
3. Verify normal navigation and the required tool work while online.
4. Disconnect the network and test reload plus the supported tool operation.

A service worker cannot guarantee offline access to every possible URL or asset unless it is cached or covered by the cache strategy. Treat offline support as a behavior to test in a real browser, not a conclusion based only on the presence of a service worker or manifest. Browser storage can also be cleared by the user or reclaimed by the browser.

**Air-gapped installation is not guaranteed.** `npm ci`, the production build, and Docker image creation ordinarily need access to npm packages and base images unless those dependencies and images have been provisioned locally in advance. Offline runtime after successful installation is a separate requirement.

## Docker deployment

Build and start the production container from the repository root:

```sh
docker compose up --build -d
```

Open <http://localhost:8080>. Stop the container with:

```sh
docker compose down
```

The container serves the generated static files with an Nginx configuration that falls back to `index.html` for client-side routes and applies explicit cache headers. Nginx does not automatically interpret Cloudflare Pages' `_headers` file; the container uses equivalent rules in `nginx/default.conf`.

To rebuild after changing code:

```sh
docker compose up --build -d
```

These Docker instructions are configuration-level documentation until a Docker build and startup test has been run on a host with Docker available.

## Cloudflare Pages deployment

For a Pages project connected to this repository, use:

- **Build command:** `npm run build`
- **Build output directory:** `build`
- **Node.js version:** a supported release matching the `engines.node` declaration

The static build includes the SPA fallback page and the `_headers` file. Confirm the production deployment serves the fallback for client-side routes, the service worker from the expected scope, and the required manifest and icons.

## Troubleshooting

- **Engine/runtime error:** check `node --version` and use a supported version from the Requirements section.
- **Dependency install fails:** run `npm ci` from the repository root and confirm `package-lock.json` matches `package.json`. Do not remove the lockfile to bypass a dependency error.
- **SvelteKit generated types are missing:** run `npm run sync` and then rerun `npm run check`.
- **Production route returns 404:** verify the adapter's `fallback: 'index.html'` output and ensure the static host or reverse proxy serves `index.html` for app routes. The provided Nginx configuration uses `try_files` for this behavior.
- **Offline reload fails:** first confirm the service worker has installed, activated, and controlled the page; then inspect the browser's Application/Storage tools and Cache Storage. Run the Playwright offline test and report its actual result.
- **Playwright cannot launch Chromium:** install the browser with `npx playwright install chromium` and follow any system-library errors printed by Playwright.
- **Docker is unavailable:** Dockerfile and Compose configuration can be reviewed as text, but image build/startup and container health remain unverified until run on a Docker host.

## Adding a tool

Review `docs/01-CONSTITUTION.md`, `docs/02-PRD.md` and `docs/03-TECHNICAL-IMPLEMENTATION-PLAN.md` before making architectural changes. Add tools using the documented registry, metadata, route, shared component and test conventions. Keep runtime dependencies local and prefer client-side processing for supported conversions.
