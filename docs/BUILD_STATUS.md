# Civit Build Status

**Purpose:** single honest checklist of roadmap phase status. A phase is ticked only when its acceptance criteria have actually been verified in the repository, CI, or a deployment — never because an agent said it was complete. See `docs/08-qwen-coder-build-guide.md` for phase prompts and `docs/how_to_use_this.md` for stage gates.

**Rule:** do not mark a code phase complete based on plans, generated snippets, or unexecuted commands. Commands that were not run must be listed as "not run" with the exact verification command.

**Last updated:** 2026-10-20 (Phase 0 / Prompt 0A)

---

## Phase status

| # | Phase | Status | Evidence / exit gate |
|---|-------|--------|----------------------|
| 0 | Planning pack & repository preparation | ✅ Complete | Planning documents committed under `docs/`; root `AGENTS.md`, `docs/decisions/0001-static-first.md`, and this status file added by Prompt 0A. No application code exists yet. |
| 0 | Agent instructions & decision records (Prompt 0A) | ✅ Complete | Files above reviewed and committed. |
| 1 | Foundation — Astro static scaffold (Prompt 1A) | ⬜ Not started | Gate: clean `pnpm install --frozen-lockfile`; `pnpm check`, `pnpm test`, `pnpm build` pass; `dist/` produced without Cloudflare credentials or a server adapter. |
| 2 | Application shell — design system, layout, a11y (Prompt 2A) | ⬜ Not started | Gate: responsive nav, home search/categories, tool-page layout, 404, skip link; manual accessibility checks recorded below. |
| 2 | Typed tool registry & routes (Prompt 2B) | ⬜ Not started | Gate: registry validation tests pass; only implemented tools visible; direct routes emitted in `dist/`. |
| 3 | Lightweight tool vertical slices (Prompts 3A–3H) | ⬜ Not started | JSON Formatter → UUID + Password → Word Counter + Base64/URL → Text Diff → Colour Converter + Contrast Checker → Unit Converter → QR Generator → Image Resize/Compress. Each slice needs UI, engine, validation, unit/browser tests, registry entry, docs. None started. |
| 4 | Test & harden online product (Prompts 4A–4B) | ⬜ Not started | Gate: CI with pinned Node/pnpm runs frozen install, checks, unit tests, build, e2e; privacy/performance review findings resolved. |
| 5 | Online deployment to Cloudflare Pages (Prompts 5A–5B) | ⬜ Not started | Gate: static Pages build from `main`; `_headers` verified on deployed responses; direct routes and 404 verified; rollback documented. |
| 6 | Online MVP release gate (Prompt 6A) | ⬜ Not started | Gate: every published registry entry is implemented and tested against PRD §12 acceptance criteria; no placeholders; known-good release tag recorded. |
| 7 | PWA / offline foundation (Prompts 7A–7B) | ⬜ Not started | Gate: cached core routes proven with networking disabled in real browsers; update/recovery behavior understood; accurate per-tool offline labels. |
| 8 | Optional heavy offline engines / large assets (Prompt 8A+) | ⬜ Not started | Gate: one approved engine downloaded, integrity-checked, used offline, removed, and recovered from interruption/quota failure; assets stay out of Pages `dist/`. |
| 9 | Docker self-hosting (Prompt 9A+) | ⬜ Not started | Gate: fresh checkout builds declared image; runs non-root; direct routes/MIME/headers correct; core vs offline variants documented honestly. |
| 10 | Later expansion (PRD waves A–D) | ⬜ Not started | Each new capability meets tool-specific performance, licence, browser-support, and offline acceptance criteria before publication. |

Legend: ✅ verified complete · ⬜ not started · 🟡 in progress · ❌ blocked/failed

## Verification log

Commands actually executed against this repository are recorded here. Do not add entries for commands that were not run.

| Date | Task | Command | Result |
|------|------|---------|--------|
| 2026-10-20 | Prompt 0A | `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build` | **Not run** — no application scaffold exists yet (deferred until Phase 1). |
| 2026-10-20 | Prompt 0A | File inspection (`ls`, document reads), `git status` | Ran; confirmed planning-pack-only repository before this change. |

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

- No application code, dependencies, lockfile, CI workflow, README, or license decision exists yet (all deferred to their phases by design).
- The planning pack lives at `docs/` while several prompts refer to `docs/planning/`; see the conflict note in the Prompt 0A report — either move the files or keep mapping the reference (current choice: files left in place, references explained in `AGENTS.md`).
- Version pins (Astro/Svelte/Tailwind/Node ≥ 22.22.0) and Cloudflare Pages limits must be re-verified against current official documentation at implementation time.
- Civit's own license and name/domain availability are undecided (Constitution Article X); required before any public release.
