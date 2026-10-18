import { Ruler } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/**
 * [Phase A, tag: L] Typography & Text. A lightweight pure-JS tool
 * (Canvas/Web APIs / no external dependencies).
 * PRD §12 catalog: Typography & Text, tag [L].
 */
export const meta: ToolMeta = {
  id: 'px-to-rem',
  name: 'PX to REM',
  description: 'Convert pixels to rem (root em) and rem to px using the configured root font size.',
  keywords: ['px', 'rem', 'convert', 'css', 'typography', 'font-size', 'responsive'],
  category: 'typography-text',
  status: 'new',
  offline: 'online-only',
  requires: [],
  icon: Ruler
};
