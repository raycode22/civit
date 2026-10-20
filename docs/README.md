# Civit deployment blueprint

This directory contains the revised project rules and two separate deployment plans.

## Documents

1. `01-CONSTITUTION.md` — architecture and engineering rules for both targets.
2. `02-PRD.md` — product requirements with online/offline requirements scoped correctly.
3. `03-TECHNICAL-IMPLEMENTATION-PLAN.md` — shared implementation work and target-specific verification.
4. `04-OFFLINE-FIRST-DECISIONS.md` — Docker/offline decisions and asset approval register.
5. `05-ONLINE-DEPLOYMENT-PLAN.md` — Cloudflare Pages deployment, Hugging Face for ML model files, ffmpeg split, size and cost controls, release checks (R2 deferred).
6. `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md` — separate build profile, asset bundling, multi-stage image, air-gapped transfer and network-disabled tests.

## Deployment principle

Build from one codebase but create two distinct outputs:

- **Online:** Cloudflare Pages hosts `build/`; fonts and libraries are bundled; ML model files load from Hugging Face Hub; every Pages file stays under 25 MiB. R2 is deferred.
- **Docker/offline:** all required runtime assets are included in the image and served locally; no external runtime network access is required.

Both targets process user content locally and prohibit uploads, analytics and telemetry. The online profile is not required to be fully offline. Offline claims apply only to the Docker target unless a separate browser-PWA offline capability is explicitly implemented and tested.

## Authority and current provider references

Cloudflare Pages and Hugging Face limits and exact build configuration can change. The online plan links to current official Cloudflare documentation and must be checked again before deployment. Plan estimates are not measured build results. These documents do not claim that a live Pages or Docker deployment has already been tested.

## Decisions of 2026-10-19

1. Docker is the fully offline version; the hosted site needs internet.
2. Fonts and JS libraries are bundled in both builds; no runtime CDNs.
3. R2 and r2.dev are deferred.
4. ffmpeg uses the single-thread core, split into pieces under 25 MiB for Pages.
5. ML models load from Hugging Face online; Docker bundles small quantised ones; each model needs approval.
6. One Docker image with a size budget of about 300 MB or less (estimate); heavy files are fetched at build time and never committed to Git; assets are precompressed.
7. Cloudflare Pages hosts the site, with GitHub holding the source.
8. The UI label becomes "Offline-ready (Docker)".
9. Work order: documents, Stage 9A, Phase A, then B, C and D.

Full log: `04-OFFLINE-FIRST-DECISIONS.md`.
