# Civit Docker Build and Self-Hosting Plan

**Implementation stage:** after the online static release and initial PWA work  
**Runtime:** unprivileged Nginx static server  
**Goal:** reproducibly serve Civit’s built static files locally, including a separately assembled offline asset set where licensed model files are supplied

## 1. Docker deployment model

Civit does not need a Node.js production server. Build the Astro project into static files and copy those files into a small, non-root Nginx runtime image. This keeps the runtime attack surface and image size smaller than shipping the build toolchain.

Docker is a second distribution path for the same static application, not a separate implementation. Any feature that fetches its runtime from a remote model host is not fully air-gapped just because the UI runs in a container. An air-gapped/offline image must include the relevant model/engine assets and licences locally.

## 2. Image variants

### `civit:latest` — core/light image

Includes the app shell, core tools, static pages, icons, offline page, and any small required runtimes. It should not include large optional models. This image is appropriate for basic local use and LAN/self-host deployments with optional online asset downloads.

### `civit:offline` — full offline bundle

Includes additional model/engine assets that the project has explicitly chosen to ship. Build it only when the asset files have been legally reviewed, checksummed, and staged locally. Expect the image to be substantially larger. Document which tools are actually offline-ready in this image.

Do not automatically download a mutable model URL during a production Docker build. Use versioned assets with recorded hashes and provenance; fail the build if required files are missing or their digest does not match.

## 3. Build architecture

Use a multi-stage build:

1. **Build stage:** a pinned Node LTS image installs the frozen pnpm dependency graph and generates static output.
2. **Optional offline assembly stage:** copy or fetch only verified, pinned model/engine assets and assemble a separate static directory (for example, `dist-offline/`) without polluting the Pages `dist/` directory.
3. **Runtime stage:** a non-root Nginx image copies in the selected output directory and an Nginx configuration that serves static routes, emits required headers, and has no writable application state.

Docker’s multi-stage build guidance recommends separating build dependencies from runtime files to reduce final image size and attack surface.

## 4. Dockerfile design notes

The following is an implementation shape, not a drop-in Dockerfile with version pins. At implementation time, pin supported image tags (and preferably digests for supply-chain-sensitive releases) and validate the chosen Nginx image’s document root, port, user, and health-check tools.

```dockerfile
# syntax=docker/dockerfile:1
FROM node:<pinned-supported-lts>-alpine AS build
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginxinc/nginx-unprivileged:<pinned-alpine-tag> AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 8080
```

Production requirements for the actual file:

- Pin the build/runtime image versions; do not use floating `latest` tags for release automation.
- Add and maintain `.dockerignore` for `.git`, `node_modules`, test results, local secrets, caches, and unrelated build outputs.
- Preserve the same route paths as the static Pages output; do not add an SPA catch-all if all routes are static HTML.
- Confirm WASM MIME type, cache headers, `X-Content-Type-Options`, referrer policy, and the same cross-origin headers (if deliberately enabled) in Nginx.
- Keep runtime writable paths to the minimum required by the image; avoid giving the server user write access to the app files.
- Do not expose Node, a debugger, or a control API in the runtime container.

### Offline image build

Prefer a distinct build command or target that assembles `dist-offline/` from the normal build output plus a directory of validated local assets. Keep the large assets out of the normal Pages output and out of Git if their size/licence requires separate handling. The implementation can use a Docker BuildKit named context for the local model directory or a pre-build assembly script. Whichever is chosen, document the exact source directory, accepted filenames, checksums, and command.

If offline image assets are not available, the offline target must fail clearly rather than silently producing an image whose UI claims the model is bundled.

## 5. Nginx configuration requirements

The Nginx server must:

- Listen on the unprivileged image’s configured port (commonly 8080 for `nginx-unprivileged`).
- Serve `/index.html`, directory-index routes, and `404.html` correctly.
- Preserve Astro’s generated route shape. For example, if `/tools/json-formatter/` maps to `/tools/json-formatter/index.html`, make sure directory-index and `try_files` behavior resolves it. Do not rewrite every unknown route to the home page.
- Serve `.wasm` as `application/wasm`; confirm all supported model types have correct content types.
- Emit equivalent cache/security headers to the Cloudflare Pages deployment. The Cloudflare `public/_headers` file is not parsed by Nginx.
- Cache fingerprinted assets for a long time, but allow HTML to revalidate.
- Avoid serving directory listings.
- Provide a health endpoint or a container health check that does not require internet access.

An initial routing pattern should be validated against the actual build output rather than guessed. The production test should request both slash and non-slash route forms and confirm the intended canonical behavior.

## 6. Cross-origin isolation in Docker

Do not set COOP/COEP just because the container is local. If a future multi-threaded WASM feature requires cross-origin isolation, add matching headers deliberately and test the required R2/local assets. For a full offline image, assets can be served from the same origin, which simplifies the cross-origin policy, but the browser requirements still apply. Keep a single-threaded/fallback path if the capability must work in browsers without the isolated context.

## 7. Commands the eventual README should document

The final commands must match the repository’s actual Dockerfile and tags. The intended usage pattern is:

```bash
# Build the core image
 docker build -t civit:latest .

# Run on loopback only by default
 docker run --rm --name civit -p 127.0.0.1:8080:8080 civit:latest

# Then open http://localhost:8080
```

For the offline image, the repository should provide a distinct documented assembly/build command that verifies the local model directory before building. Do not imply the simple core command embeds optional models.

If the container is exposed to another device on a LAN, bind it intentionally and use HTTPS at a trusted reverse proxy. `http://localhost` is treated as a trustworthy origin by modern browsers for many APIs, but a plain `http://192.168.x.x` LAN URL is not generally equivalent for service workers, installability, or other secure-context APIs.

## 8. Security posture

- Run the Nginx server as a non-root user and listen on an unprivileged port.
- Do not mount the Docker socket into the container.
- Do not mount user home directories or arbitrary host paths.
- Do not run privileged or host-network mode for this static app.
- Avoid writable root filesystem where the selected image/config supports it; test temporary paths before enabling `read_only`.
- Keep container capabilities minimized and drop unnecessary capabilities when compatible with the image.
- Scan base images and final image in CI; rebuild on security updates.
- Pin and verify model assets; treat externally supplied assets as untrusted until verified.
- Bind to loopback in default run instructions; publish broadly only with an explicit network/security setup.

## 9. CI validation

After Docker is introduced, CI should:

1. Build the production static artifact.
2. Build the core container image.
3. Inspect the image for accidental inclusion of `.git`, `node_modules`, test fixtures, secrets, or unlicensed models.
4. Run the container and wait for the health check.
5. Test home, each representative direct route, 404 behavior, CSS/JS/WASM MIME, and cache/security headers.
6. Run a browser smoke test against the container URL.
7. For the offline image, disable outbound network in the test and run at least one representative model-enabled task.
8. Record image size and compare against an agreed regression threshold.

## 10. Release and update flow

- Build tagged images from a reviewed commit and attach build provenance/checksums where the registry supports it.
- Publish the core and offline variants as distinct tags; list which features/models are bundled in each release.
- Keep the previous known-good image tag for rollback.
- On updates, re-pull/rebuild intentionally. A static container does not have an automatic application updater unless one is explicitly added.
- Do not store user files or outputs in the container filesystem; the app is designed to process/export locally in the browser.

## 11. Docker stage exit gate

Docker is complete only when a fresh checkout can build the declared image, the image runs non-root, direct routes and headers are correct, local capabilities work without internet where claimed, optional assets are accounted for, and the documentation accurately distinguishes the core image from the offline bundle.
