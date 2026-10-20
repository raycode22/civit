// Civit registry validation — Phase 2, Prompt 2B.
// Build/test-time invariants required by docs/planning/03-technical-implementation-plan.md §4:
// no duplicate IDs/slugs, no missing category, no unresolved route/implementation,
// no unsupported public entries.

import { tools } from './registry';
import { TOOL_CATEGORIES, type ToolCategory, type ToolMetadata } from './types';

export interface RegistryIssue {
  toolId: string;
  problem: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Validate the whole registry. Returns an empty array when all invariants hold. */
export function validateRegistry(entries: readonly ToolMetadata[] = tools): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const tool of entries) {
    if (seenIds.has(tool.id)) issues.push({ toolId: tool.id, problem: 'duplicate id' });
    if (seenSlugs.has(tool.slug)) issues.push({ toolId: tool.id, problem: 'duplicate slug' });
    seenIds.add(tool.id);
    seenSlugs.add(tool.slug);

    if (!SLUG_PATTERN.test(tool.slug))
      issues.push({ toolId: tool.id, problem: `invalid slug "${tool.slug}"` });
    if (tool.id !== tool.slug)
      issues.push({ toolId: tool.id, problem: 'id and slug must match by convention' });

    if (!(TOOL_CATEGORIES as readonly string[]).includes(tool.category))
      issues.push({ toolId: tool.id, problem: `missing/unknown category "${tool.category}"` });

    if (tool.name.trim().length === 0)
      issues.push({ toolId: tool.id, problem: 'empty display name' });
    if (tool.shortDescription.trim().length === 0)
      issues.push({ toolId: tool.id, problem: 'empty short description' });

    // An implemented tool must resolve to a real component/loader (no phantom routes).
    if (tool.status === 'implemented' && !tool.component)
      issues.push({ toolId: tool.id, problem: 'implemented tool has no component/loader' });

    // Planned/in-progress tools must not advertise a component (unresolved entry risk).
    if (tool.status !== 'implemented' && tool.component)
      issues.push({ toolId: tool.id, problem: 'non-implemented tool declares a component' });
  }
  return issues;
}

/** True only when every published (implemented) entry is fully resolvable. */
export function registryIsSound(): boolean {
  return validateRegistry().length === 0;
}

export type { ToolCategory };
