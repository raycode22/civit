/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import manifest from '../../assets/manifest.json';
import { tools } from '$lib/tools/registry';
import { ONLINE_MODEL_ORIGIN } from '$lib/assets/resolver';

/**
 * [Stage 9A] Guards tying the Docker asset manifest and the online origin
 * allowlist to the live registry/resolver, so the build-time checks can never
 * silently drift from the app (FR-40, FR-43, D-09).
 *
 * Like tests/unit/registry.test.ts, the audit script is read through Vite's
 * `import.meta.glob` raw import instead of `node:fs`, because @types/node is
 * deliberately kept out of this project's dependency set.
 */

const auditModules = import.meta.glob('../../scripts/audit-runtime-urls.mjs', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;
const auditSrc = Object.values(auditModules)[0] ?? '';

describe('assets/manifest.json stays in sync with the tool registry (FR-43, D-09)', () => {
  it('manifest is present and versioned', () => {
    expect(manifest.version).toBeGreaterThanOrEqual(1);
  });

  it('toolIds matches the registered tool ids exactly', () => {
    const registryIds = tools.map((t) => t.id).sort();
    const manifestIds = [...(manifest.toolIds ?? [])].sort();
    expect(manifestIds).toEqual(registryIds);
  });
});

describe('online origin allowlist stays aligned with the resolver (FR-40, D-04)', () => {
  it('the audit script allowlists exactly the approved Hugging Face origin', () => {
    expect(auditSrc).toContain(ONLINE_MODEL_ORIGIN);
    // R2 is deferred (D-03): no r2.dev or R2 origin may reappear anywhere.
    expect(auditSrc).not.toContain('r2.dev');
    expect(auditSrc).not.toContain('r2.cloudflarestorage.com');
  });
});
