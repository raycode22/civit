import { Paperclip } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/** [Phase A, tag: L] Typography & Text. Lightweight pure-JS tool that
 *  references paper sizes and their dimensions. PRD §12 catalog:
 *  Typography & Text, tag [L]. */
export const meta: ToolMeta = {
  id: 'paper-sizes',
  name: 'Paper Sizes',
  description: 'Reference paper sizes and their dimensions.',
  keywords: [
    'paper',
    'paper sizes',
    'a4',
    'letter',
    'legal',
    'a3',
    'a5',
    'dimensions',
    'printer',
    'print'
  ],
  category: 'typography-text',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: Paperclip
};
