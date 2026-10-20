# Civit Build Status

**Purpose:** single honest checklist of roadmap phase status. A phase is ticked only when its acceptance criteria have actually been verified in the repository, CI, or a deployment — never because an agent said it was complete. See `docs/planning/08-qwen-coder-build-guide.md` for phase prompts and `docs/planning/how_to_use_this.md` for stage gates.

**Rule:** do not mark a code phase complete based on plans, generated snippets, or unexecuted commands. Commands that were not run must be listed as "not run" with the exact verification command.

**Last updated:** 2026-10-20 (Phase 1 / Prompt 1A)

---

## Phase status

| # | Phase | Status | Evidence / exit gate |
|---|-------|--------|----------------------|
| 0 | Planning pack & repository preparation | ✅ Complete | Planning documents committed under the canonical `docs/planning/`; root `AGENTS.md`, `docs/decisions/0001-static-first.md`, and this status file added by Prompt 0A; pack relocated and references reconciled by Prompt 0B (`git mv`, history preserved). No application code exists yet. |
| 0 | Agent instructions & decision records (Prompt 0A) | ✅ Complete | `AGENTS.md`, ADR 0001, and this status file reviewed and committed in the Prompt 0A checkpoint commit. |
| 0 | Repository organization & root README (Prompt 0B) | 🟡 In progress | Working tree only — awaiting user review/commit. Changes: planning pack relocated to `docs/planning/` via `git mv`; root `README.md` created; references updated in `AGENTS.md`, this file, and ADR 0001. No scaffold, dependencies, or application code added. |
| 1 | Foundation — Astro static scaffold (Prompt 1A) | 🟡 Implemented, awaiting review/commit | Scaffolded at repo root on Node 22.22.0 / pnpm 10.34.7: Astro `^7.4.1` (`output: 'static'`), `@astrojs/svelte ^9.1.0` + Svelte `^5.57.2`, Tailwind `^4.3.3` via `@tailwindcss/vite`, TS strict (`astro/tsconfigs/strict`) with `typescript ~5.9.0` + `@astrojs/check`, Vitest `^3.2.7`. Ran & passed: `pnpm install --frozen-lockfile`, `pnpm check` (0 errors/warnings/hints), `pnpm test` (3/3), `pnpm build` (static `dist/index.html` + hashed JS/CSS incl. compiled Svelte island), `pnpm preview` (HTTP 200). Astro telemetry disabled locally. Not done here: lint/format tooling and `.github/workflows/ci.yml` (planned Prompt 1B); no PWA/Docker/backend added. |
| 2 | Application shell — design system, layout, a11y (Prompt 2A) | ❌ Not started | Gate: responsive nav, home search/categories, tool-page layout, 404, skip link; manual accessibility checks recorded below. |
| 2 | Typed tool registry & routes (Prompt 2B) | ❌ Not started | Gate: registry validation tests pass; only implemented tools visible; direct routes emitted in `dist/`. |
| 3 | Lightweight tool vertical slices (Prompts 3A–3H) | ❌ Not started | JSON Formatter → UUID + Password → Word Counter + Base64/URL → Text Diff → Colour Converter + Contrast Checker → Unit Converter → QR Generator → Image Resize/Compress. Each slice needs UI, engine, validation, unit/browser tests, registry entry, docs. None started. |
| 4 | Test & harden online product (Prompts 4A–4B) | ❌ Not started | Gate: CI with pinned Node/pnpm runs frozen install, checks, unit tests, build, e2e; privacy/performance review findings resolved. |
| 5 | Online deployment to Cloudflare Pages (Prompts 5A–5B) | ❌ Not started | Gate: static Pages build from `main`; `_headers` verified on deployed responses; direct routes and 404 verified; rollback documented. |
| 6 | Online MVP release gate (Prompt 6A) | ❌ Not started | Gate: every published registry entry is implemented and tested against PRD §12 acceptance criteria; no placeholders; known-good release tag recorded. |
| 7 | PWA / offline foundation (Prompts 7A–7B) | ❌ Not started | Gate: cached core routes proven with networking disabled in real browsers; update/recovery behavior understood; accurate per-tool offline labels. |
| 8 | Optional heavy offline engines / large assets (Prompt 8A+) | ❌ Not started | Gate: one approved engine downloaded, integrity-checked, used offline, removed, and recovered from interruption/quota failure; assets stay out of Pages `dist/`. |
| 9 | Docker self-hosting (Prompt 9A+) | ❌ Not started | Gate: fresh checkout builds declared image; runs non-root; direct routes/MIME/headers correct; core vs offline variants documented honestly. |
| 10 | Later expansion (PRD waves A–D) | ❌ Not started | Each new capability meets tool-specific performance, licence, browser-support, and offline acceptance criteria before publication. |

Legend: ✅ verified complete · ❌ not started · 🟡 in progress · ❌ blocked/failed

## Verification log

Commands actually executed against this repository are recorded here. Do not add entries for commands that were not run.

| Date | Task | Command | Result |
|------|------|---------|--------|
| 2026-10-20 | Prompt 0A | `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build` | **Not run** — no application scaffold exists yet (deferred until Phase 1). |
| 2026-10-20 | Prompt 0A | File inspection (`ls`, document reads), `git status` | Ran; confirmed planning-pack-only repository before this change. |
| 2026-10-20 | Prompt 0B | `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build` | **Not run** — still no application scaffold (deferred until Phase 1); documentation-only task. |
| 2026-10-20 | Prompt 0B | `git mv` of 10 planning docs into `docs/planning/`; repo-wide grep for stale `docs/<plan>.md` references; relative-link existence check over all Markdown files; `find`/`wc` inventory | Ran; see the Prompt 0B task report. One incident: a failed edit truncated `docs/BUILD_STATUS.md` mid-task; it was rebuilt from `git show HEAD:docs/BUILD_STATUS.md` with cp1251→UTF-8 mojibake repair, so the pre-existing garbled non-ASCII characters in that file are now corrected too. |

## Manual accessibility test checklist

To be filled in during Phase 2 (Prompt 2A) and re-run at each release. **No items verified yet.**

- [ ] All interactive controls reachable and operable by keyboard alone (Tab/Shift+Tab/Enter/Space/Escape).
- [ ] Visible focus indicator on every focusable element; never rely on colour alone for status.
- [ ] Skip-to-content link works from the first tab stop.
- [ ] Mobile navigation open/close manages focus correctly and does not trap it.
- [ ] Screen reader announces accessible names for nav, search, tool inputs/outputs, and status/error messages.
- [ ] Copy/download actions announce success/failure via a live region.
- [ ] Page zoom to 200% and narrow-viewport reflow keep content usable without horizontal scrolling.
- [ ] `prefers-reduced-motion` is respected by any animation added later.
- [ ] Text/background combinations meet WCAG 2.2 AA contrast for the shipped theme tokens.

## Known gaps and follow-ups

- No application code, dependencies, lockfile, or CI workflow exists yet (all deferred to their phases by design). A root `README.md` now exists (Prompt 0B); a license decision is still outstanding.
- Resolved (Prompt 0B): the planning pack now lives at `docs/planning/`, matching the path used by `docs/planning/08-qwen-coder-build-guide.md`. Operational files stay at the root (`AGENTS.md`, `README.md`) and `docs/` top level (`BUILD_STATUS.md`, `decisions/`).
- Version pins (Astro/Svelte/Tailwind/Node ≥ 22.22.0) and Cloudflare Pages limits must be re-verified against current official documentation at implementation time.
- Civit's own license and name/domain availability are undecided (Constitution Article X); required before any public release.
