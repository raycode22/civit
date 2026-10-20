import { Type } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/** [Phase A, tag: L] Typography & Text. Lightweight pure-JS tool that
 *  browses a font's glyphs/characters. PRD §12 catalog:
 *  Typography & Text, tag [L]. */
export const meta: ToolMeta = {
  id: 'glyph-browser',
  name: 'Glyph Browser',
  description: 'Browse the glyphs/characters available in a font.',
  keywords: [
    'glyph',
    'glyph browser',
    'character',
    'unicode',
    'font',
    'typeface',
    'character map',
    'cmap'
  ],
  category: 'typography-text',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: Type
};
