// Civit tool registry types — Phase 2, Prompt 2B.
// Derived from docs/planning/03-technical-implementation-plan.md §4 "Tool registry contract".

/** Publication state of a tool. Only `implemented` tools may appear in production navigation. */
export type ToolStatus = 'planned' | 'in-progress' | 'implemented';

/** Canonical categories used by the catalogue and future category browsing (Prompt 2C). */
export const TOOL_CATEGORIES = ['developer', 'text', 'design'] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/** Asset weight class per the registry contract (§4). */
export type AssetWeightClass = 'small' | 'medium' | 'large';

/** Offline support level per the registry contract (§4). */
export type OfflineSupport = 'core' | 'optional-engine' | 'online-only';

/** The kinds of input a tool accepts (§4). Used for capability/privacy notes. */
export type InputKind = 'text' | 'file' | 'camera' | 'microphone' | 'display' | 'model-asset';

/** Expected output/export actions (§4). Kept as open strings with known common values. */
export type OutputAction = 'copy' | 'download' | 'clipboard-paste';

/** Stable tool id: kebab-case, unique across the registry. */
export type ToolId = string;

/**
 * Single source of display metadata and discovery for one tool.
 * Field list follows the technical plan §4 registry contract.
 */
export interface ToolMetadata {
  /** Stable identifier, equal to the slug by convention. */
  id: ToolId;
  /** URL-safe slug; routes are /tools/<slug>/. */
  slug: string;
  /** Display name. */
  name: string;
  /** Short human description shown in listings/search results. */
  shortDescription: string;
  /** Primary category. */
  category: ToolCategory;
  /** Free-form tags for grouping/filtering. */
  tags: readonly string[];
  /** Extra search keywords/aliases beyond name and description. */
  keywords: readonly string[];
  /** Publication status. Controls visibility in production navigation. */
  status: ToolStatus;
  /** Component/loader identifier (route or dynamic-import key). Undefined for planned tools. */
  component?: string;
  /** Accepted input kinds. */
  inputs: readonly InputKind[];
  /** Expected output types (MIME-ish or logical names). */
  outputs: readonly string[];
  /** Export actions offered. */
  exportActions: readonly OutputAction[];
  /** Estimated asset weight class. */
  assetWeight: AssetWeightClass;
  /** Offline support level. */
  offlineSupport: OfflineSupport;
  /** Browser capability predicates required (feature names checked at runtime later). */
  capabilities: readonly string[];
  /** Concise privacy note (constitution Article I: local processing claims must be true). */
  privacyNote: string;
  /** Tool-specific input size limit note, if any. */
  sizeLimit?: string;
}

/** True only for tools that are implemented and safe to show as working. */
export function isImplementedTool(tool: ToolMetadata): boolean {
  return tool.status === 'implemented';
}

/** Shape check for validation tests (partial entries → required-field presence). */
export function hasRequiredFields(tool: Partial<ToolMetadata>): tool is ToolMetadata {
  return (
    typeof tool.id === 'string' &&
    typeof tool.slug === 'string' &&
    typeof tool.name === 'string' &&
    typeof tool.shortDescription === 'string' &&
    typeof tool.category === 'string' &&
    TOOL_CATEGORIES.includes(tool.category as ToolCategory) &&
    Array.isArray(tool.tags) &&
    Array.isArray(tool.keywords) &&
    typeof tool.status === 'string'
  );
}
