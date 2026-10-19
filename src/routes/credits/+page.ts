import type { PageLoad } from './$types';

/** [NEW] Prerendered credits page (Constitution §17, PRD FR-35). */
export const prerender = true;

/** Third-party licences and credits (also maintained at CREDITS.md). */
const CREDITS = `# Civit — Credits & Licences

**Document type:** Third-party asset register (Constitution §17, PRD FR-35)
**Scope:** All third-party libraries, fonts, WASM builds, and ML models shipped
or fetched by Civit, in either the online or Docker/offline delivery target.

## Principle

Every third-party dependency or asset must have a verified licence and a
documented source/version. No component ships whose licence obligations are
unverified. This register mirrors the \`04-OFFLINE-FIRST-DECISIONS.md\`
localisation register for assets packaged into the Docker/offline image.

## Application dependencies (build-time, bundled by Vite)

| Package | Purpose | Licence | Source | Version |
|---------|---------|---------|--------|---------|
| SvelteKit | Application framework | MIT | https://kit.svelte.dev | 2.x |
| Svelte 5 | UI framework | MIT | https://svelte.dev | 5.x |
| Vite+ | Build toolchain | MIT | https://vite-plus.dev | 1.x |
| Tailwind CSS | Styling | MIT | https://tailwindcss.com | 4.x |
| DaisyUI | Component library | MIT | https://daisyui.com | 5.x |
| Fuse.js | Fuzzy search | MIT | https://fusejs.io | 7.x |
| lucide-svelte | Icons | ISC | https://lucide.dev | 1.x |
| TypeScript | Type checking | Apache-2.0 | https://typescriptlang.org | 6.x |
| Playwright | E2E testing | MIT | https://playwright.dev | 1.x |
| svelte-check | Svelte diagnostics | MIT | https://github.com/sveltejs/language-tools | 4.x |

## Client-side runtime assets

| Asset | Tool(s) | Type | Licence | Source | Status |
|-------|---------|------|---------|--------|--------|
| (none yet) | | | | | |

> No heavy runtime assets (WASM binaries, ML models, fonts beyond the system
> stack) are currently bundled. When an asset is approved for the Docker/offline
> image, add it here and to \`assets/manifest.json\` with version, licence,
> checksum, and size.

## Notes

- User files and conversion outputs never leave the user's device; no third
  party receives user content.
- The online target (Cloudflare Pages) bundles fonts, stylesheets and JS
  libraries. Its only approved third-party runtime origin is Hugging Face
  Hub, for ML model files (D-03: R2 deferred; D-04). Those requests carry no
  user data.
- The Docker/offline target packages every required runtime asset into the
  image and makes no external runtime requests.
`;

export const load: PageLoad = async () => {
  return { credits: CREDITS, loaded: true };
};
