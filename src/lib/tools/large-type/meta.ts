import { Type } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/** [Phase A, tag: L] Typography & Text. Lightweight pure-JS tool that
 *  renders text at very large sizes (signage / visibility aid). PRD §12
 *  catalog: Typography & Text, tag [L]. */
export const meta: ToolMeta = {
  id: 'large-type',
  name: 'Large Type',
  description: 'Display text at very large sizes for signage and visibility aids.',
  keywords: [
    'large type',
    'big text',
    'signage',
    'billboard',
    'visibility',
    ' typography',
    'display text'
  ],
  category: 'typography-text',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: Type
};
