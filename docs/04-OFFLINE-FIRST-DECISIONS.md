# Civit --- Docker/Offline Decisions and Asset Localisation Register

**Document type:** Decision record and approval register  
**Status:** Active; revised 2026-10-18 to separate online and Docker targets  
**Scope:** Docker/offline profile only, except where an item explicitly governs both targets.  
**Related documents:** `01-CONSTITUTION.md`, `02-PRD.md`, `03-TECHNICAL-IMPLEMENTATION-PLAN.md`, `05-ONLINE-DEPLOYMENT-PLAN.md`, `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md`.

## 1. Purpose and scope

Civit has two release targets built from the same source. This document records the decisions and approval register for the **self-contained Docker/offline target**. It does not require the online Cloudflare Pages build to self-host every dependency or avoid approved CDN/R2 requests. The online target is described in `05-ONLINE-DEPLOYMENT-PLAN.md`.

The Docker image is built online, with access to package registries and approved acquisition sources, but must run without external network access once created. An air-gapped machine receives the completed image via `docker save` / `docker load`; it must not need to download base images, npm dependencies, libraries, WASM files, fonts, or models at runtime.

## 2. Decisions

| # | Decision | Date | Status |
|---|---|---|---|
| D-01 | Civit has two delivery profiles: online Cloudflare Pages + R2, and a separate Docker/offline profile. | 2026-10-18 | Accepted for this plan |
| D-02 | Cloudflare Pages is the primary online host; use its static output directory `build/`. | 2026-10-18 | Accepted for this plan |
| D-03 | The existing Cloudflare R2 bucket is the online origin for large public assets; use an R2 custom domain for production delivery. | 2026-10-18 | Settled by owner |
| D-04 | Online runtime may use approved public R2/CDN asset origins. Npm packages should normally be installed at build time and bundled by Vite unless runtime CDN delivery has a concrete advantage. | 2026-10-18 | Target rule |
| D-05 | Docker build may access the internet while building; Docker runtime must not require external network access. | 2026-10-18 | Owner decision |
| D-06 | Every released Docker tool is expected to be `offline: full`; if this is not technically possible, stop and obtain an explicit documented owner-approved exception before release. | 2026-10-18 | Owner decision |
| D-07 | Required Docker runtime assets, including approved heavy assets, are included in the image and served from the container's local origin. | 2026-10-18 | Owner decision |
| D-08 | Heavy assets (approximately 50 MB or more, especially FFmpeg cores and ML weights) require per-asset approval before being acquired and bundled in Docker. | 2026-10-18 | Owner decision |
| D-09 | Tool routes are prerendered via SvelteKit `entries`; each registered tool should emit `build/tools/<tool-id>.html`. | 2026-10-18 | Owner decision |
| D-10 | The app processes user content locally; no file/input/output uploads, analytics, or telemetry are allowed in either profile. | 2026-10-18 | Shared privacy rule |
| D-11 | Browser-PWA offline caching is optional and independent from the Docker offline guarantee. The online release must not be blocked on browser-wide offline support. | 2026-10-18 | Revised project scope |
| D-12 | A tool's `offline` registry value records Docker/offline readiness; it is not a promise that a fresh browser session on the online site will work without internet. | 2026-10-18 | Registry rule |

## 3. Docker asset approval rules

- Record every runtime asset that must be placed into the Docker image before acquisition or bundling: asset name, intended tool, version, canonical source, licence, estimated/measured size, checksum where practical, and owner decision.
- Do not treat an npm package installed from the lockfile as a runtime download; build tooling and app dependencies are installed during image construction and the final runtime image contains only the static output and required runtime files.
- Heavy assets must receive explicit owner approval. Do not substitute a different model/build/version without recording and approving the change.
- Verify all licence obligations before shipping. Include online CDN-delivered dependencies and Docker-localised assets in the public credits/licences surface.
- No asset may be marked `added` until the exact file is acquired, its checksum/size is recorded, its licence is checked, and its inclusion in the Docker build is tested.

## 4. Size estimates (not measurements)

| Component | Estimated size | Scope/notes |
|---|---:|---|
| App shell and lightweight tools | 2–5 MB | Source estimate; measure actual output |
| Phase B libraries | 1–5 MB | Source estimate; verify build output and tree-shaking |
| FFmpeg WASM core | about 30 MB raw | Shared by audio/video tools; exact build must be approved |
| Background Remover model | 5–180 MB | Depends on the approved model |
| Auto Subtitle model | 40–460 MB | Depends on the approved model |
| Full Docker image | Not established | Measure the actual compressed and uncompressed image; do not assume the original estimate is accurate |

The online version does not need to store every remote asset in Pages. Large public files belong on R2, with free-tier usage monitored separately. Docker image size depends on the assets approved for the offline profile.

## 5. Docker localisation register

Status values: `proposed`, `approved`, `added`, `rejected`.

| Asset | Tool(s) | Type | Version | Canonical source | Licence | Size | SHA-256 | Status | Owner decision |
|---|---|---|---|---|---|---:|---|---|---|
| (populate during Docker asset audit) | | font / JS / WASM / model / other | | | | | | proposed | |

## 6. Release exceptions

A Docker tool may not be marked `partial` or `online-only` by default. Any exception requires an explicit owner decision and a reason in its `meta.ts` and must be reflected in user-facing capability information.

| Tool | Value | Reason | Approved by | Date |
|---|---|---|---|---|
| (none) | | | | |

## 7. Remaining asset decisions

- Approve the exact FFmpeg WASM build, threading mode, licence, checksum, size and memory/file-size limits before Phase C ships.
- Approve each ML model (Background Remover, Auto Subtitle, and any ML-based Artwork Enhancer) before adding it to Docker.
- Record the actual R2 asset custom domain and production CORS/cache policy in `05-ONLINE-DEPLOYMENT-PLAN.md`.
- Keep the online URL allowlist and Docker local asset manifest separate; test both after dependency or asset changes.
