# Civit --- Docker/Offline Deployment Plan

**Status:** Separate deployment target; build/release work follows the online launch plan  
**Cost target:** $0 in application hosting/runtime fees; use open-source Docker/Nginx and free package sources. Hardware/electricity and any provider overages are outside this guarantee.  
**Scope:** Self-contained runtime. The online asset origin is never a runtime dependency.

## 1. Objective and non-goals

Produce an image that can be built while connected to the internet, transferred to another machine, started locally, and used with external networking disabled. Every released tool marked `offline: full` must operate from assets packaged into the image.

This is not the online Pages build with a network switch. It is a separate build profile from the same codebase, using a local asset base and its own build-output validation. Do not add Hugging Face, R2 or third-party CDN URLs to the Docker runtime bundle.

## 2. Target architecture

```text
Build machine (internet available)
  ├─ pulls pinned Node/Nginx base images
  ├─ installs locked npm dependencies
  ├─ downloads only owner-approved offline assets and verifies hashes
  ├─ builds with CIVIT_TARGET=docker / local asset resolver
  └─ creates slim multi-stage image
           │
           ├─ docker save / transfer / docker load (air-gapped install)
           ▼
Runtime machine (external network unavailable)
  └─ Nginx serves static `build/` and packaged assets from the image
       ├─ no npm / Node / package manager at runtime
       ├─ no external CDN/R2/API/model fetches
       └─ browser conversion processing stays on the user's device
```

## 3. Build profile and source reuse

- Use the same SvelteKit/Vite+ source tree; do not maintain a second copy of app code.
- Add an explicit build-time target setting (for example `CIVIT_TARGET=docker`). Implement it through the project's existing config/scripts and verify the current Vite+ version supports the final implementation. Do not assume an unverified CLI flag.
- The target setting controls only asset origins/packaging and any target-specific metadata. Shared component logic and tool behavior should remain the same.
- Centralize public asset resolution. For `online`, the resolver returns Pages-relative paths, and Hugging Face Hub URLs for ML model files; for Docker, it must resolve to a relative local path such as `/assets/...`.
- Do not build once for online and copy that output into Docker. Produce and inspect a distinct Docker build output.
- Use an asset manifest to list each file expected in the Docker image. Verify required manifest entries at build time.

## 4. Dependency and asset acquisition

1. Run the repository-approved install command against the committed lockfile (`npm ci` if that remains the selected package workflow). Resolve network/setup failures before declaring the build reproducible.
2. Do not commit `node_modules`, downloaded build caches, or derived artifacts into Git.
3. Download large runtime binaries/models only after the owner approves the exact asset in `04-OFFLINE-FIRST-DECISIONS.md`. Pin versions and use SHA-256 checksums; fail the build if a required asset is missing or has the wrong hash.
4. Capture licences and required notices for all libraries, fonts, WASM builds and ML weights. Ship the credits/licences surface and any required licence files in the image.
5. Do not download an asset during container startup. Runtime code must not fall back to Hugging Face, R2 or CDNs if a local file is missing; fail visibly rather than violating the offline guarantee.

## 5. Multi-stage image design

Use a multi-stage build:

- **Builder stage:** pinned Node LTS image, package installation, verified asset acquisition, Vite+ checks/tests/build. This stage may use the network.
- **Runtime stage:** pinned Nginx image with the static `build/` output, approved runtime assets, Nginx config, and required notices only.
- Keep Node, Vite+, npm, `node_modules`, tests, source files and package caches out of the runtime stage unless a concrete runtime requirement justifies inclusion.
- Pin base image versions, preferably immutable digests in release CI, and define a deliberate update cadence so security fixes are not frozen forever.
- Configure correct MIME types for `.wasm`, fonts and other static assets; set caching for content-hashed files; include any required CSP and COOP/COEP response headers.
- Serve precompressed static text and WASM assets (Brotli where supported, gzip otherwise). Verify which Nginx image or module provides Brotli (`gzip_static` is the fallback), test content negotiation end to end, and record the size gain.

## 6. Image size and performance

- Preserve per-tool lazy loading: bundling all approved assets into the image does not mean downloading them all on every browser session.
- Prefer browser-native APIs for simple tasks and share large runtimes (for example one approved FFmpeg core) across tools where practical.
- Avoid duplicate versions of a library/model, development dependencies in the runtime image, source maps/test fixtures in production, and unneeded locales/encoders.
- Measure image size with `docker image inspect` and the export archive size. Report actual numbers; treat existing 40–50 MB and 150–300 MB figures as estimates only.
- Size budget: about 300 MB or less for the single image (owner-set target; estimate). If the measured image exceeds it, stop and ask the owner about smaller or quantised models or a slim variant. Do not silently omit assets or add a slim/full release matrix without approval.
- Prefer the smallest quantised model with acceptable quality, and ask the owner before bundling each one.

## 7. Runtime security and privacy

- Run as a non-root Nginx user where the image/configuration allows; use a read-only root filesystem and drop unnecessary capabilities when compatible with Nginx's runtime directories.
- Do not add a backend, telemetry, analytics or upload endpoint. Tool workflows must not send user content outside the browser.
- The container should not need outbound networking. Test startup and tool use with external networking disabled.
- Do not place secret tokens or R2 credentials in the image, browser bundle, Docker build args that persist in image layers, or Git.
- Use `localhost` or HTTPS for browser secure-context features. A Docker app opened via plain HTTP on a LAN IP may not have service workers, clipboard, microphone or screen capture; show clear capability errors.
- If multi-threaded WASM is selected, verify cross-origin isolation headers on the actual Nginx response. Keep the online Pages header check separate.

## 8. Build and release sequence

1. Review the exact commit and clean working tree.
2. Run shared gates in the builder: `vp check`, `vp test run`, `vp build` for the Docker profile, and Playwright tests available in CI.
3. Validate output files: `build/index.html`, `build/tools/<tool-id>.html` for every registered tool, `build/_headers` if used, `build/theme-init.js`, all manifest-listed runtime files, and the absence of required online-origin asset URLs.
4. Build the image and inspect its final contents. Verify the image has no unnecessary build tooling or credentials.
5. Start the image with external networking disabled. Verify Nginx is serving pages and assets from inside the container, then run browser tests with external requests blocked.
6. Run every tool marked `offline: full` end to end, not only the landing page. Cover input, conversion, errors, cancellation, worker/WASM/model loading, and output download.
7. Export the tested image with `docker save`, transfer it to a clean test machine without internet, load it with `docker load`, and start it without pulling any image layers or packages.
8. Record image tag, source commit, base image digests, asset manifest/checksums, tests, image size and exported archive size.

Example transfer commands (replace the tag with the actual release tag):

```bash
docker save civit:offline -o civit-offline.tar
# Transfer civit-offline.tar to the offline machine.
docker load -i civit-offline.tar
docker run --rm --name civit-offline --network none civit:offline
```

With `--network none`, confirm the web server from inside the container (for example with `docker exec` and a local HTTP request) and run browser offline tests using the project's verified test topology. Do not claim the host browser can connect through an ordinary published port when the container has no network interface; test container isolation and browser offline behavior as separate checks if needed.

## 9. Update and supply-chain policy

- Rebuild after a security update to Node, Vite+, SvelteKit, Nginx, a library, a WASM binary, or a model.
- Asset changes must update the manifest, checksum, licence record and any credits page.
- Avoid unpinned `latest` runtime URLs and mutable remote files. Every required Docker asset needs a reproducible acquisition source or a recorded offline mirror/cache for the build stage.
- The build may use the internet; the released image must not require it.
- An air-gapped deployment can only be as updated as the last image exported to it. Document release version and update procedure.

## 10. Acceptance checklist

- [ ] Docker build is reproducible from the lockfile and approved asset manifest.
- [ ] The Docker profile uses only local asset URLs; the R2 domain and online CDN URLs are absent from required runtime asset paths.
- [ ] Required assets are included in the final image and correctly served by Nginx with appropriate MIME/cache/security headers.
- [ ] Node, Vite+, npm, `node_modules`, development files, caches and credentials are excluded from the final runtime image where not needed.
- [ ] Every released tool marked `offline: full` passes network-disabled end-to-end testing.
- [ ] The container starts and serves files without external networking.
- [ ] `docker save` / `docker load` transfer has been tested on a clean offline machine, including base-image layers.
- [ ] Image size, export size, asset hashes, licences, source commit and base-image identifiers are recorded.
- [ ] Measured image size is within the owner-set budget (about 300 MB or less), or an approved exception is recorded.
- [ ] Static text and WASM assets are served precompressed and the size gain is recorded.
- [ ] No user files/outputs are uploaded and no telemetry or analytics is emitted.
