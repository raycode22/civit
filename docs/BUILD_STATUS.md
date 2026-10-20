# Civit Build Status

**Purpose:** single honest checklist of roadmap phase status. A phase is ticked only when its acceptance criteria have actually been verified in the repository, CI, or a deployment — never because an agent said it was complete. See `docs/planning/08-qwen-coder-build-guide.md` for phase prompts and `docs/planning/how_to_use_this.md` for stage gates.

**Rule:** do not mark a code phase complete based on plans, generated snippets, or unexecuted commands. Commands that were not run must be listed as "not run" with the exact verification command.

**Last updated:** 2026-10-20 (Phase 1 / Prompt 1B)

---

## Phase status

| # | Phase | Status | Evidence / exit gate |
|---|-------|--------|----------------------|
| 0 | Planning pack & repository preparation | ✅ Complete | Planning documents committed under the canonical `docs/planning/`; root `AGENTS.md`, `docs/decisions/0001-static-first.md`, and this status file added by Prompt 0A; pack relocated and references reconciled by Prompt 0B (`git mv`, history preserved). Superseded note: an application scaffold now exists (Phase 1 / Prompt 1A, recorded below). |
| 0 | Agent instructions & decision records (Prompt 0A) | ✅ Complete | `AGENTS.md`, ADR 0001, and this status file reviewed and committed in the Prompt 0A checkpoint commit. |
| 0 | Repository organization & root README (Prompt 0B) | ✅ Complete | Committed as `504b75b`: planning pack relocated to `docs/planning/` via `git mv`; root `README.md` created; references updated in `AGENTS.md`, this file, and ADR 0001. No scaffold was part of this prompt (the scaffold arrived later in Prompt 1A, commit `5827faa`). |
| 1 | Foundation — Astro static scaffold (Prompt 1A) | 🟡 Implemented, locally verified; awaiting review/checkpoint commit | Scaffolded at repo root and committed as `5827faa`: Node 22.22.0 / pnpm 10.34.7; Astro `^7.4.1` (`output: 'static'`), `@astrojs/svelte ^9.1.0` + Svelte `^5.57.2`, Tailwind `^4.3.3` via `@tailwindcss/vite`, TS strict (`astro/tsconfigs/strict`) with `typescript ~5.9.0` + `@astrojs/check`, Vitest `^3.2.7`. Ran & passed: `pnpm install --frozen-lockfile`, `pnpm check` (0 errors/warnings/hints), `pnpm test` (3/3), `pnpm build` (static `dist/index.html` + hashed JS/CSS incl. compiled Svelte island), `pnpm preview` (HTTP 200). Astro telemetry disabled locally. Not done here: lint/format tooling and `.github/workflows/ci.yml` (planned Prompt 1B); no PWA/Docker/backend added. |
| 1 | Shared application shell & theme system (Prompt 1B) | 🟡 Implemented, locally verified; awaiting review/checkpoint commit | Added `src/layouts/BaseLayout.astro` (semantic landmarks, skip link, responsive nav placeholders, footer), `src/styles/theme.css` (documented light/dark tokens via `[data-theme]`, OS default + explicit override, safe storage fallback), `src/components/ThemeToggle.svelte` (Svelte 5 runes island, accessible name, polite status announcement), `src/lib/theme/theme.ts` (pure resolution/persistence logic + pre-paint script source), `src/pages/tools/index.astro` (`/tools/` honest placeholder); refactored `src/pages/index.astro` onto the shared layout with WIP wording preserved. No new dependencies. Ran & passed: `pnpm check` (0/0/0 across 11 files), `pnpm test` (2 files, 11 tests incl. 8 new theme tests), `pnpm build` (static, 2 pages: `/index.html` + `/tools/index.html`), `pnpm preview` + `curl` (HTTP 200 on `/` and `/tools/`). Structural HTML checks on `dist/` passed; WCAG text-token contrast measured by relative-luminance calculation. Not browser-tested: toggle clicks, persistence across reload, flash-of-wrong-theme, console errors, mobile/desktop rendering. |
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
| 2026-10-20 | Prompt 1A | `pnpm install --frozen-lockfile` (Node 22.22.0 / pnpm 10.34.7) | Ran; passed — "Already up to date" against the committed `pnpm-lock.yaml`. |
| 2026-10-20 | Prompt 1A | `pnpm check` (`astro check`) | Ran; passed — 0 errors, 0 warnings, 0 hints across 7 files. |
| 2026-10-20 | Prompt 1A | `pnpm test` (`vitest run`) | Ran; passed — 1 test file, 3 tests (word-count engine unit tests). |
| 2026-10-20 | Prompt 1A | `pnpm build` (`astro check && astro build`) | Ran; passed — Astro reported `output: "static"`, 1 page built; `dist/` contains `index.html` + hashed JS/CSS assets including the compiled Svelte island (~68 KB total). |
| 2026-10-20 | Prompt 1A | `pnpm preview` + `curl` | Ran; passed — HTTP 200 and expected landing-page `<title>` served from the built `dist/`. |
| 2026-10-20 | Prompt 1A | `pnpm dev` | **Not run** — dev-server path covered equivalently by `pnpm preview` on the production build; no separate claim made. |
| 2026-10-20 | Prompt 1B | `pnpm check` (`astro check`) | Ran; initially failed with 1 error (`ts(2307)` bad relative import in `src/pages/tools/index.astro` — my own mistake, caught and fixed to `../../layouts/...`); re-ran — 0 errors, 0 warnings, 0 hints across 11 files. |
| 2026-10-20 | Prompt 1B | `pnpm test` (`vitest run`) | Ran; passed — 2 test files, 11 tests (3 existing word-count engine + 8 new theme resolution/persistence tests covering OS fallback, explicit override, invalid values, throwing/unavailable storage, round-trip). |
| 2026-10-20 | Prompt 1B | `pnpm build` (`astro check && astro build`) | Ran; passed — static output, 2 pages built; `dist/tools/index.html` emitted at the expected path alongside `dist/index.html`; compiled `ThemeToggle` JS bundle present. |
| 2026-10-20 | Prompt 1B | `grep` inspection of `dist/index.html` and `dist/tools/index.html` | Ran; both contain `<header>`/`<nav aria-label="Main">`/`<main id="main">`/`<footer>` landmarks, the skip link targeting `#main`, the inline pre-paint theme script referencing `civit-theme-preference`, and the toggle button's SSR `aria-label="Switch to light theme"`. |
| 2026-10-20 | Prompt 1B | WCAG relative-luminance contrast calculation (Python) on shipped tokens | Ran; dark bg #0f1115 → text 15.7:1, muted 7.3:1, accent 9.7:1; light bg #f7f8fa → text 15.5:1, muted 6.2:1, accent 5.6:1 (all ≥ 4.5:1). Decorative surface/border pairs are low-contrast by design (not used for text). This is a token-level check, not a rendered-page screenshot audit. |
| 2026-10-20 | Prompt 1B | `pnpm preview` + `curl` on both routes | Ran; passed — `/` and `/tools/` both served HTTP 200 from the built `dist/`; served home title is "Local-first browser toolkit (work in progress) — Civit", nav link to `/tools/` present, and the served tools page contains the honest "No tools are implemented yet" copy. |
| 2026-10-20 | Prompt 1B | Real-browser interaction (clicking the toggle, reload persistence, reduced-motion, console-error check, mobile/desktop rendering) | **Not run** — no browser automation exists in this phase by design (Playwright arrives later). These behaviors are implemented but unverified in a real browser. |

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

- Current gaps (post Prompt 1B): the shared shell, theme system, and `/tools/` placeholder pass all available static checks, but browser-dependent behavior (toggle clicks, localStorage persistence across reload, absence of flash-of-wrong-theme, console cleanliness, mobile/desktop rendering, screen-reader announcements) has **not been exercised in a real browser**; contrast was verified by token-level luminance math, not a rendered-page audit. Version pins were confirmed via npm-registry metadata rather than direct review of official rendered documentation pages; re-verify Astro/Svelte/Tailwind/Node ≥ 22.22.0 guidance and Cloudflare Pages limits at implementation time. Note: the committed Prompt 1A row above mentions "lint/format tooling and CI workflow (planned Prompt 1B)" — the approved Prompt 1B scope for this session is the shared shell/theme system, so those items remain unstarted and are tracked here rather than silently absorbed. A license decision is still outstanding (see below); no `LICENSE` file exists and none should be inferred from `package.json`’s `UNLICENSED` placeholder.
- Resolved (Prompt 0B): the planning pack now lives at `docs/planning/`, matching the path used by `docs/planning/08-qwen-coder-build-guide.md`. Operational files stay at the root (`AGENTS.md`, `README.md`) and `docs/` top level (`BUILD_STATUS.md`, `decisions/`).
- Version pins (Astro/Svelte/Tailwind/Node ≥ 22.22.0) and Cloudflare Pages limits must be re-verified against current official documentation at implementation time.
- Civit's own license and name/domain availability are undecided (Constitution Article X); required before any public release.
