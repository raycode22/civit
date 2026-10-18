# Civit deployment blueprint

This directory contains the revised project rules and two separate deployment plans.

## Documents

1. `01-CONSTITUTION.md` — architecture and engineering rules for both targets.
2. `02-PRD.md` — product requirements with online/offline requirements scoped correctly.
3. `03-TECHNICAL-IMPLEMENTATION-PLAN.md` — shared implementation work and target-specific verification.
4. `04-OFFLINE-FIRST-DECISIONS.md` — Docker/offline decisions and asset approval register.
5. `05-ONLINE-DEPLOYMENT-PLAN.md` — Cloudflare Pages + existing R2 setup, online assets, CORS/cache, cost controls and release checks.
6. `06-DOCKER-OFFLINE-DEPLOYMENT-PLAN.md` — separate build profile, asset bundling, multi-stage image, air-gapped transfer and network-disabled tests.

## Deployment principle

Build from one codebase but create two distinct outputs:

- **Online:** Cloudflare Pages hosts `build/`; the existing R2 bucket serves large public assets; approved third-party CDNs are allowed under an explicit origin/licence policy.
- **Docker/offline:** all required runtime assets are included in the image and served locally; no external runtime network access is required.

Both targets process user content locally and prohibit uploads, analytics and telemetry. The online profile is not required to be fully offline. Offline claims apply only to the Docker target unless a separate browser-PWA offline capability is explicitly implemented and tested.

## Authority and current provider references

Cloudflare Pages/R2 limits and exact build configuration can change. The online plan links to current official Cloudflare documentation and must be checked again before deployment. Plan estimates are not measured build results. These documents do not claim that a live Pages or Docker deployment has already been tested.
