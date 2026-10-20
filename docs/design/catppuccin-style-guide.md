# Civit Catppuccin Style Guide

Permanent design-system reference for Civit. Adapted — not copied — from the official
[Catppuccin style guide]; Civit is **not** an official Catppuccin project.

Attribution: Catppuccin palette and semantic-role guidance © the Catppuccin community
([palette](https://catppuccin.com/palette/), [style guide][official style guide]).
daisyUI component styles © [daisyUI](https://daisyui.com/) (MIT).

## 1. Purpose and scope

Civit's visual system is **Catppuccin Latte** (light) and **Catppuccin Mocha** (dark),
delivered through **daisyUI 5** custom themes on top of **Tailwind CSS v4**. This guide
governs colors, theme behavior, and component conventions for every UI surface in the
repository. It applies to humans and AI coding agents alike.

## 2. Authoritative references

- Official Catppuccin style guide: <https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md>
- Official Catppuccin palette (exact hex values): <https://catppuccin.com/palette/>
- daisyUI 5 themes & configuration: <https://daisyui.com/docs/themes/>, <https://daisyui.com/docs/config/>
- daisyUI + Astro installation: <https://daisyui.com/docs/install/astro/>
- The actual implementation lives in [`src/styles/theme.css`](../../src/styles/theme.css)
  (theme definitions), [`src/styles/global.css`](../../src/styles/global.css) (`@plugin "daisyui"`),
  and [`src/lib/theme/theme.ts`](../../src/lib/theme/theme.ts) (resolution logic).

## 3. Theme policy

| User-facing choice | Catppuccin flavor | `data-theme` value |
|---|---|---|
| Light | Latte | `catppuccin-latte` |
| Dark | Mocha | `catppuccin-mocha` |

- With no saved choice, follow `prefers-color-scheme` (light → Latte, dark → Mocha).
- An explicit choice made with the header toggle overrides the OS preference and is
  persisted in `localStorage` under `civit-theme-preference`. Storage failures degrade
  silently to the OS/default theme; the page must always render.
- The resolved theme is applied by an inline pre-paint script (see `PREPAINT_SCRIPT`)
  to avoid a flash of the wrong theme.
- Only these two flavors are supported. Frappé/Macchiato and four-way theme pickers are
  out of scope. All theme behavior is local-only (no network, no analytics).

## 4. Color palette reference

Exact official values (verified against the palette page during Prompt 1B revision):

| Semantic token | Latte (light) | Mocha (dark) |
|---|---|---|
| Base | `#eff1f5` | `#1e1e2e` |
| Mantle | `#e6e9ef` | `#181825` |
| Crust | `#dce0e8` | `#11111b` |
| Surface 0 | `#ccd0da` | `#313244` |
| Surface 1 | `#bcc0cc` | `#45475a` |
| Surface 2 | `#acb0be` | `#585b70` |
| Overlay 0 | `#9ca0b0` | `#6c7086` |
| Overlay 1 | `#8c8fa1` | `#7f849c` |
| Overlay 2 | `#7c7f93` | `#9399b2` |
| Text | `#4c4f69` | `#cdd6f4` |
| Subtext 1 | `#5c5f77` | `#bac2de` |
| Subtext 0 | `#6c6f85` | `#a6adc8` |
| Blue | `#1e66f5` | `#89b4fa` |
| Green | `#40a02b` | `#a6e3a1` |
| Yellow | `#df8e1d` | `#f9e2af` |
| Red | `#d20f39` | `#f38ba8` |

Additional accent values used only where mapped below: Peach `#fe640b` (Latte accent)
and Pink `#f5c2e7` (Mocha accent); white `#ffffff` as a legibility foreground (see §9).

## 5. Semantic usage

Follow Catppuccin's role guidance — choose colors by role, never arbitrarily:

- **Page background:** Base (`bg-base-100`).
- **Secondary surfaces:** Mantle and Crust (`bg-base-200`, `bg-base-300`) — headers, footers, code chips.
- **Cards / UI surfaces:** Surface 0–2 via `--civit-surface-0/1/2`, chosen for contrast and hierarchy; most cards use `bg-base-200`.
- **Body text & headings:** Text (`text-base-content`).
- **Labels & secondary copy:** Subtext 0/1 (`--civit-subtext-0/1`). Note the measured caveat in §9 for Subtext 0 in Latte.
- **Subtle borders/separators:** Surface 2 / Overlay 0 (`--civit-border-subtle`).
- **Links & URLs:** Blue (`link link-primary`, `text-primary`).
- **Primary actions:** Blue (`btn-primary`).
- **Informational pills/tags:** Blue soft badges (`badge-primary badge-soft`).
- **Success:** Green · **Warnings:** Yellow · **Errors:** Red.
- **Selection backgrounds:** Overlay 2 at ~30% opacity (`::selection` in `theme.css`).
- **Focus indicators:** Blue outline (`--civit-focus`), 2 px with offset — visible against every base/mantle/crust surface (≥ 3:1 non-text contrast).

## 6. Catppuccin Blue rule

**Blue is Civit's recognizable primary accent** for links, primary actions, focus rings,
and informational badges. Do **not** substitute Mauve or daisyUI's default primary.
Other accents (Peach/Pink as `--color-accent`) exist only as sparingly used secondary
highlights; neutral surfaces carry most of the interface. Never rainbow-tool the UI.

## 7. daisyUI mapping

Themes are defined with the official daisyUI 5 syntax: plain `--color-*` variables inside
`@layer theme { [data-theme='catppuccin-latte'] { … } }` blocks in
[`src/styles/theme.css`](../../src/styles/theme.css), loaded via `@plugin "daisyui" { themes: false; }`
in [`src/styles/global.css`](../../src/styles/global.css) so **only** the two custom themes exist.

| daisyUI variable | Latte | Mocha | Rationale |
|---|---|---|---|
| `--color-base-100/200/300` | Base / Mantle / Crust | same roles | §5 layering |
| `--color-base-content` | Text | Text | body copy |
| `--color-primary` / `-content` | Blue / White | Blue / Crust | see §9 for the measured foreground choices |
| `--color-secondary` / `-content` | Surface 2 / Subtext 1 | Surface 1 / Text | neutral UI fills |
| `--color-accent` / `-content` | Peach / White | Pink / Crust | secondary highlight only |
| `--color-neutral` / `-content` | Subtext 1 / Base | Overlay 0 / Text | muted controls |
| `--color-info` / `-content` | Blue / White | Blue / Crust | informational |
| `--color-success` / `-content` | Green / White | Green / Crust | success (§9 caveat in Latte) |
| `--color-warning` / `-content` | Yellow / Text | Yellow / Crust | warnings (§9 caveat in Latte) |
| `--color-error` / `-content` | Red / White | Red / Crust | errors |
| radius/border tokens | `0.5rem` boxes, `0.25rem` fields, `1px` border | same | restrained shape language |

Derived-value note: white `#ffffff` is not a Catppuccin palette color; it is used as a
foreground on saturated Latte accents because every palette foreground that meets AA on
those backgrounds is white (documented per-token in `theme.css`). If a pairing fails
contrast, legibility wins over literal palette purity — exactly as the upstream style
guide instructs ("Legibility always comes first").

## 8. Component conventions

- **Buttons:** `btn btn-primary` for the single main action per view; `btn-variant-outline`
  (current: theme toggle) for secondary; `btn-sm`/`btn-xs` for dense areas. One primary button per region.
- **Cards:** `card bg-base-200` + `border border-[var(--civit-border-subtle)]`; content in `card-body`; `card-title` for headings.
- **Badges:** status/info = `badge badge-primary badge-soft`; neutral counts = `badge badge-neutral badge-soft`. Badges must contain text or be paired with text — never colour-only meaning.
- **Forms:** native labels (`label for`), Tailwind layout utilities, minimal daisyUI form classes (`textarea`, `input`); error text uses `text-error` **plus** wording.
- **Navigation:** shared `BaseLayout` landmarks; active item marked with `aria-current="page"` and `text-primary`; mobile row uses badges, desktop row plain links.
- **Alerts:** prefer `alert alert-neutral`/`info` with icon + text; avoid solid Yellow/Green fills for small text (see §9).
- **Surfaces:** step one level darker/lighter per nesting depth; do not mix Crust cards on Base pages without a border.

## 9. Accessibility

Measured with WCAG relative-luminance math (full table recorded in
[`docs/BUILD_STATUS.md`](../BUILD_STATUS.md)); targets: ≥ 4.5:1 normal text, ≥ 3:1 large text and non-text indicators.

Passing highlights — Latte: Text/Base 7.06, Text/Mantle 6.57, Text/Crust 6.04, Subtext1/Base 5.53, White/Blue 4.91, White/Red 5.43; Mocha: Text/Base 11.34, Crust/Blue (primary button) 8.91, Blue-on-Base link 7.79, all status pairs ≥ 8.1. Secondary-copy convention: `text-base-content/70` composites to ≈Subtext 0 (Latte ≈ #8c8fa1 → 4.51:1 on Base, 4.20:1 on Mantle — small text there should step up to full `text-base-content`; Mocha ≈ Overlay 1 → ≥ 5.7:1 everywhere).

Known measured shortfalls and required treatments (do not claim these pass):
- Latte **Blue foreground on light surfaces = 4.34:1** (< 4.5 for normal text; ≥ 3:1 so it passes for large text and UI components). All Catppuccin-palette foregrounds fail worse (Text 1.63, Crust 3.71). Mitigations: links ship underlined (`link`) with semibold nav treatment; primary buttons use white content (4.91:1). Open issue: consider a slightly darkened derived blue in a future revision if strict AA for small links is required — deliberately not done here to keep official hexes.
- Latte **Green fill + white text = 3.34:1** and **Yellow fill + Text = 3.05:1** — AA only for large/bold text. Convention: use these fills for icons/non-text indicators or soft variants; full-size body text goes on `alert-neutral` with colored icon + text.
- Latte **Subtext 0 on Base = 4.37:1** — use Subtext 1 (5.53:1) for small secondary text; Subtext 0 only ≥ 18.66 px.
- Focus outlines: Blue vs Base/Mantle/Crust ≥ 4.04:1 (Latte) and ≥ 7.79:1 (Mocha) — pass the 3:1 non-text requirement.

Also required: keyboard operability everywhere, visible `:focus-visible` ring, accessible
names (the toggle's `aria-label` states the *target* theme), polite concise live-region
announcement after theme change, and no colour-only status communication. These checks
are token-level calculations, **not** a rendered-page audit; browser/screen-reader
verification is scheduled with Phase 2 e2e work.

## 10. Implementation rules

- Use semantic daisyUI utilities (`bg-base-100`, `text-primary`, …) or the documented
  `--civit-*` tokens. **No hardcoded one-off hex values** in components/pages.
- Tailwind handles layout/spacing/responsiveness; daisyUI handles component skin; Catppuccin defines the palette. Don't blend roles.
- New tokens require updating this guide + contrast verification (§12).
- Do not introduce another component library, icon pack, CDN stylesheet, or remote font
  without an explicit decision record.
- Keep `color-scheme` set per theme (done in `theme.css`) so native controls match.

## 11. Examples

```astro
<!-- Primary button -->
<button class="btn btn-primary">Run tool</button>

<!-- Card -->
<section class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
  <div class="card-body gap-0">
    <h2 class="card-title text-xl">Status</h2>
    <p class="text-[var(--civit-subtext-1)]">Processed locally in your browser.</p>
  </div>
</section>

<!-- Link (underlined; Latte ratio caveat documented above) -->
<a href="/tools/" class="link link-primary">Browse planned tools</a>

<!-- Informational badge -->
<span class="badge badge-primary badge-soft normal-case">Planned</span>
```

## 12. Change policy

Any change to theme tokens, flavor mapping, or accent roles must: (1) update
`src/styles/theme.css` and this guide together, (2) re-run the WCAG calculations for
affected foreground/background pairs and record results in `docs/BUILD_STATUS.md`,
(3) keep both themes working with the pre-paint script and storage fallbacks, and
(4) note deviations from Catppuccin guidance with a measured rationale. Catppuccin's
semantic mappings are guidelines — each actual pairing still has to prove legible.

[official style guide]: https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md
