import { RotateCcw } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/** [Phase A, tag: L] Images & Assets. Lightweight Canvas 2D tool: deskew a
 *  rotated/scanned image. PRD §12 catalog: Images & Assets, tag [L]. */
export const meta: ToolMeta = {
  id: 'image-de-skew',
  name: 'Image De-skew',
  description: 'Straighten a rotated or skewed image, entirely in your browser.',
  keywords: ['deskew', 'straighten', 'rotate', 'skew', 'scan', 'image', 'auto-rotate'],
  category: 'images-assets',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: RotateCcw
};
