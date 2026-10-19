/**
 * [REVISED in Stage 9A] Centralized public asset resolution (Docker plan §3).
 *
 * Resolves public asset URLs based on the build-time `CIVIT_TARGET` setting:
 *
 *   - `online` (default, Cloudflare Pages): bundled assets resolve to
 *     same-origin Pages-relative paths (D-03: R2 is deferred). ML model files
 *     resolve to the pinned Hugging Face Hub origin (D-04, D-15).
 *   - `docker`: every asset resolves to a relative local path under
 *     `/assets/...` so the runtime image never depends on external network
 *     access (D-05, D-07).
 *
 * `CIVIT_TARGET` is injected at build time by Vite+ (`define` in
 * `vite.config.ts`) via `import.meta.env`. It defaults to `online`, so local
 * development and Cloudflare Pages builds behave as before.
 */

/** Build-time delivery target. Injected by Vite+; never read from `process.env`. */
const CIVIT_TARGET: 'online' | 'docker' | undefined = import.meta.env.CIVIT_TARGET;

/**
 * Pinned Hugging Face Hub model origin for the online profile (D-04, D-15).
 * Only ML model files may be loaded from this origin online; every other
 * asset is bundled and served same-origin.
 */
export const ONLINE_MODEL_ORIGIN = 'https://huggingface.co';

/** Resolved build target, defaulting to `online`. */
export const ASSET_TARGET: 'online' | 'docker' = CIVIT_TARGET ?? 'online';

/**
 * Resolve a bundled public asset path (font, library, WASM, …) to a runtime
 * URL.
 *
 * - Docker → local path, e.g. `/assets/wasm/ffmpeg-core.wasm`
 * - Online → same-origin Pages-relative path (bundled into the Pages output)
 */
export function resolveAsset(assetPath: string): string {
  const normalized = assetPath.replace(/^\//, '');

  if (ASSET_TARGET === 'docker') {
    return `/assets/${normalized}`;
  }

  // Online profile: bundled assets are part of the Pages build and are always
  // fetched from the Pages origin itself (D-03: no R2, no CDN).
  return `/${normalized}`;
}

/**
 * Resolve an ML model file to its runtime URL (D-15).
 *
 * - Online → pinned Hugging Face Hub URL, e.g.
 *   `https://huggingface.co/<repo>/resolve/<rev>/<file>`
 * - Docker → local packaged path, e.g. `/assets/models/<file>`
 *
 * The caller supplies the pinned repository/revision so versions stay
 * explicit and auditable; nothing here may fall back to a mutable `main`
 * reference at runtime.
 */
export function resolveModelAsset(repo: string, revision: string, filePath: string): string {
  const normalized = filePath.replace(/^\//, '');

  if (ASSET_TARGET === 'docker') {
    return `/assets/models/${normalized}`;
  }

  return `${ONLINE_MODEL_ORIGIN}/${repo}/resolve/${revision}/${normalized}`;
}

/**
 * Return the asset base for display / diagnostics. Docker shows the local
 * mount; online shows the same-origin base plus the approved model origin.
 */
export function getAssetBase(): string {
  if (ASSET_TARGET === 'docker') return '/assets';
  return `/ (Pages origin); models: ${ONLINE_MODEL_ORIGIN}`;
}
