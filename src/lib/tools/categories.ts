import type { Tool, ToolMeta, ToolCategory } from './types';

/**
 * [NEW] Canonical sidebar/grouping order for the three in-scope categories
 * (PRD FR-22).
 */
export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  'images-assets',
  'audio-video',
  'typography-text'
] as const;

/** [NEW] Human-readable category labels (British English, Constitution §18). */
export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  'images-assets': 'Images & Assets',
  'audio-video': 'Audio & Video',
  'typography-text': 'Typography & Text'
};

/** [NEW] One category group for the sidebar (PRD FR-22). */
export interface CategoryGroup {
  category: ToolCategory;
  label: string;
  tools: ToolMeta[];
}

/**
 * [NEW] Group tools by category for the sidebar, preserving
 * {@link TOOL_CATEGORIES} order and dropping groups with no tools (so an
 * empty category never renders as a stray heading).
 */
export function groupToolsByCategory(tools: ToolMeta[]): CategoryGroup[] {
  const groups: CategoryGroup[] = [];
  for (const category of TOOL_CATEGORIES) {
    const members = tools.filter((tool) => tool.category === category);
    if (members.length > 0) {
      groups.push({ category, label: CATEGORY_LABELS[category], tools: members });
    }
  }
  return groups;
}

/** [NEW] Order tools by category without grouping (used for card grids). */
export function sortToolsByCategory(tools: ToolMeta[]): ToolMeta[] {
  return groupToolsByCategory(tools).flatMap((group) => group.tools);
}

/** [NEW] Type guard for registry entries; useful in tests. */
export function isTool(value: unknown): value is Tool {
  return typeof value === 'object' && value !== null && 'component' in value;
}
