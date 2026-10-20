# Civit Project Planning Pack

This folder contains the initial product and engineering specification for Civit, a local-first, privacy-focused browser utility suite inspired by the user-provided Delphi.tools research.

## Documents

- [`how_to_use_this.md`](how_to_use_this.md) — reading order, stage gates, and definition of done.
- [`01-constitution.md`](01-constitution.md) — product principles and non-negotiable architecture constraints.
- [`02-prd.md`](02-prd.md) — MVP scope, personas, requirements, later roadmap, and acceptance criteria.
- [`03-technical-implementation-plan.md`](03-technical-implementation-plan.md) — architecture, dependencies, code layout, testing, and stage gates.
- [`04-online-deployment-plan.md`](04-online-deployment-plan.md) — Cloudflare Pages static deployment and large asset distribution.
- [`05-offline-pwa-plan.md`](05-offline-pwa-plan.md) — PWA installability, caching, optional engine downloads, quota/eviction and tests.
- [`06-docker-build-plan.md`](06-docker-build-plan.md) — multi-stage build, static runtime, non-root operation, and offline image variant.
- [`07-research-and-stack-validation.md`](07-research-and-stack-validation.md) — source-vs-research distinction, current docs, and revisions to the supplied stack proposal.
- [`08-qwen-coder-build-guide.md`](08-qwen-coder-build-guide.md) — step-by-step prompts and acceptance checks tailored to Qwen Coder in the browser.

## Recommended sequence

**Foundation → Online MVP → PWA core → Optional heavy offline engines → Docker → Wider tool catalogue.**

The supplied research provides product direction and candidate tool taxonomy. It is not treated as independent proof that all source-stack version claims are current or that all listed tools are already validated. The stack validation document records the key corrections.

## Key architecture decisions

- Use Astro + Svelte 5 + TypeScript for the initial application.
- Deploy static output to Cloudflare Pages first; do not add server APIs or a database to the MVP.
- Keep large model binaries out of Pages output. Pages currently has a 25 MiB per-asset limit; use a separately configured R2 custom domain for large downloadable engines/models.
- Add PWA support only after online routes/tools are stable. Cache a small core, download large engines explicitly, and represent offline readiness per tool.
- Build Docker from the static artifact using a non-root web server image. Keep any full offline model bundle separate from the normal Pages build.
- Use Rust/WASM, Comlink, Turborepo, FFmpeg, PDF, and ML libraries selectively when a specific feature justifies the cost.

## Status

These documents are a plan, not an implemented or tested repository. Package versions, browser support, Cloudflare account limits, and model licences must be verified again at implementation time. The release gates describe how to turn the plan into a tested product rather than assuming that the architecture alone guarantees correctness.
