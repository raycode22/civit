# Civit --- Docker/Offline Decisions and Asset Localisation Register

**Document type:** Decision record and approval register  
**Status:** Active; revised 2026-10-18 to separate online and Docker targets; owner decisions of 2026-10-19 applied (hosting, models, size, compression)  
**Scope:** Docker/offline profile only, except where an item explicitly governs both targets.  
**Related documents:** `01-CONSTITUTION.md`, `02-PRD.md`, `03-TECHNICAL-IMPLEMENTATION-PLAN.md`, `05-ONLINE-DEPLOYMENT-PLAN.md`, `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md`.

## 1. Purpose and scope

Civit has two release targets built from the same source. This document records the decisions and approval register for the **self-contained Docker/offline target**. The online Cloudflare Pages build bundles its fonts and libraries and may load ML model files only from Hugging Face Hub (D-04, D-15). The online target is described in `05-ONLINE-DEPLOYMENT-PLAN.md`.

The Docker image is built online, with access to package registries and approved acquisition sources, but must run without external network access once created. An air-gapped machine receives the completed image via `docker save` / `docker load`; it must not need to download base images, npm dependencies, libraries, WASM files, fonts, or models at runtime.

## 2. Decisions

| # | Decision | Date | Status |
|---|---|---|---|
| D-01 | Civit has two delivery profiles: online Cloudflare Pages (R2 deferred, see D-03), and a separate Docker/offline profile. | 2026-10-18 | Accepted for this plan |
| D-02 | Cloudflare Pages is the primary online host; use its static output directory `build/`. | 2026-10-18 | Accepted for this plan |
| D-03 | [REVISED 2026-10-19] R2 is deferred. Large online assets are not served from R2 for now and r2.dev is not used. R2 with a custom domain on an owner-controlled domain remains an optional later change. | 2026-10-19 | Owner (accepted recommendation) |
| D-04 | [REVISED 2026-10-19] Fonts, stylesheets and JS libraries are bundled into both builds; no runtime CDNs. The only approved third-party runtime origin for the online profile is Hugging Face Hub, for ML model files. | 2026-10-19 | Owner (accepted recommendation) |
| D-05 | Docker build may access the internet while building; Docker runtime must not require external network access. | 2026-10-18 | Owner decision |
| D-06 | Every released Docker tool is expected to be `offline: full`; if this is not technically possible, stop and obtain an explicit documented owner-approved exception before release. | 2026-10-18 | Owner decision |
| D-07 | Required Docker runtime assets, including approved heavy assets, are included in the image and served from the container's local origin. | 2026-10-18 | Owner decision |
| D-08 | Heavy assets (approximately 50 MB or more, especially FFmpeg cores and ML weights) require per-asset approval before being acquired and bundled in Docker. | 2026-10-18 | Owner decision |
| D-09 | Tool routes are prerendered via SvelteKit `entries`; each registered tool should emit `build/tools/<tool-id>.html`. | 2026-10-18 | Owner decision |
| D-10 | The app processes user content locally; no file/input/output uploads, analytics, or telemetry are allowed in either profile. | 2026-10-18 | Shared privacy rule |
| D-11 | Browser-PWA offline caching is optional and independent from the Docker offline guarantee. The online release must not be blocked on browser-wide offline support. | 2026-10-18 | Revised project scope |
| D-12 | A tool's `offline` registry value records Docker/offline readiness; it is not a promise that a fresh browser session on the online site will work without internet. | 2026-10-18 | Registry rule |
| D-13 | Offline scope: Docker is the fully offline version, with every tool and model bundled. The hosted Cloudflare Pages site needs internet. Browser-PWA offline stays an optional extra. | 2026-10-19 | Owner (accepted recommendation) |
| D-14 | ffmpeg uses the single-thread core. On Pages it is split into pieces under 25 MiB that the browser joins before loading. Measure the real core size first; multi-threading needs a new owner decision. | 2026-10-19 | Owner (accepted recommendation) |
| D-15 | ML models load from Hugging Face Hub on the online profile. Docker bundles small, quantised versions. Each model needs owner approval (licence, size) before use. | 2026-10-19 | Owner (accepted recommendation) |
| D-16 | One Docker image with a size budget of about 300 MB or less (owner-set target; estimate). If the measured image exceeds it, stop and ask about smaller models or a slim variant. | 2026-10-19 | Owner (accepted recommendation) |
| D-17 | Heavy files are fetched at build time with pinned versions and SHA-256 checks and are never committed to Git. | 2026-10-19 | Owner (accepted recommendation) |
| D-18 | Serve static text and WASM assets precompressed (Brotli where supported, gzip otherwise) and record the size gain. | 2026-10-19 | Owner (accepted recommendation) |
| D-19 | Hosting: Cloudflare Pages for the site, with GitHub holding the source. | 2026-10-19 | Owner (accepted recommendation) |
| D-20 | UI label: the "works offline" badge and filter become "Offline-ready (Docker)". | 2026-10-19 | Owner (accepted recommendation) |
| D-21 | Work order: documents, Stage 9A, Phase A tools, then B, C and D. | 2026-10-19 | Owner (accepted recommendation) |

## 3. Docker asset approval rules

- Record every runtime asset that must be placed into the Docker image before acquisition or bundling: asset name, intended tool, version, canonical source, licence, estimated/measured size, checksum where practical, and owner decision.
- Do not treat an npm package installed from the lockfile as a runtime download; build tooling and app dependencies are installed during image construction and the final runtime image contains only the static output and required runtime files.
- Heavy assets must receive explicit owner approval. Do not substitute a different model/build/version without recording and approving the change.
- Verify all licence obligations before shipping. Include online remotely delivered assets (Hugging Face models) and Docker-localised assets in the public credits/licences surface.
- No asset may be marked `added` until the exact file is acquired, its checksum/size is recorded, its licence is checked, and its inclusion in the Docker build is tested.

## 4. Size estimates (not measurements)

| Component | Estimated size | Scope/notes |
|---|---:|---|
| App shell and lightweight tools | 2–5 MB | Source estimate; measure actual output |
| Phase B libraries | 1–5 MB | Source estimate; verify build output and tree-shaking |
| FFmpeg WASM core | about 30 MB raw | Shared by audio/video tools; exact build must be approved |
| Background Remover model | 5–180 MB | Depends on the approved model |
| Auto Subtitle model | 40–460 MB | Depends on the approved model |
| Docker image | Budget: about 300 MB or less (owner-set target; estimate) | Measure the actual compressed and uncompressed image and the export archive. If over budget, stop and ask the owner about smaller models or a slim variant |

The online version keeps every Pages file under the 25 MiB per-file cap (the ffmpeg core is split if needed) and loads ML models from Hugging Face Hub. Docker image size depends on the assets approved for the offline profile and is held to the budget above.

## 5. Docker localisation register

Status values: `proposed`, `approved`, `added`, `rejected`.

| Asset | Tool(s) | Type | Version | Canonical source | Licence | Size | SHA-256 | Status | Owner decision |
|---|---|---|---|---|---|---:|---|---|---|
| (none approved yet — Phase A tools are pure-JS and require no localised runtime assets) | | | base64-image-encoder, px-to-rem, word-counter, favicon-generator, image-clipper | — | — | — | — | — | proposed | Stage 9A audit complete: all five tools run from bundled code only; nothing to localise for Docker until heavy assets (ffmpeg core, ML models, fonts) are individually approved |
| | FFmpeg single-thread core | | audio/video tools (future Phase C) | WASM | — | — | ≈ 30 MB raw (estimate) | — | proposed | Owner approval required before acquisition (D-08); measure real core size before bundling (FR-48 / Stage 9A pending item) |
| | ML models (Background Remover, Auto Subtitle) | | future ML tools | model | — | Hugging Face Hub | — | 5–460 MB (estimate) | — | proposed | Owner approval per model required before Docker bundling (D-15); online profile loads models from Hugging Face Hub only |

## 6. Release exceptions

A Docker tool may not be marked `partial` or `online-only` by default. Any exception requires an explicit owner decision and a reason in its `meta.ts` and must be reflected in user-facing capability information.

| Tool | Value | Reason | Approved by | Date |
|---|---|---|---|---|
| (none) | | | | |

## 7. Remaining asset decisions

- Approve the exact FFmpeg WASM build, threading mode, licence, checksum, size and memory/file-size limits before Phase C ships.
- Approve each ML model (Background Remover, Auto Subtitle, and any ML-based Artwork Enhancer) before adding it to Docker.
- R2 is deferred (D-03). If adopted later, record the owner-controlled custom domain and the CORS/cache policy in `05-ONLINE-DEPLOYMENT-PLAN.md`.
- Approve each Hugging Face model repository and version (licence, size) before the online profile references it.
- Measure the ffmpeg core and confirm whether it needs splitting for Pages' 25 MiB cap.
- Keep the online URL allowlist and Docker local asset manifest separate; test both after dependency or asset changes.
