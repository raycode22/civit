import { EyeOff } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/** [Phase A, tag: L] Images & Assets. Lightweight Canvas 2D tool: apply a
 *  redaction/mask region to an image. PRD §12 catalog: Images & Assets, tag [L]. */
export const meta: ToolMeta = {
  id: 'image-masker',
  name: 'Image Masker',
  description: 'Apply a redaction or mask region to an image, entirely in your browser.',
  keywords: ['mask', 'redact', 'privacy', 'blur', 'black out', 'censor', 'image', 'region'],
  category: 'images-assets',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: EyeOff
};
