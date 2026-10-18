import { ImageUp } from '@lucide/svelte';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64-image-encoder',
  name: 'Base64 Image Encoder',
  description: 'Convert an image file into a Base64 data URI, entirely in your browser.',
  keywords: ['base64', 'image', 'data uri', 'encode', 'decoder', 'dataurl'],
  category: 'images-assets',
  // Status per the PRD §12 catalog (all catalogued tools start as "new").
  status: 'new',
  // Offline target per the PRD §12 catalog; backed by the network-disabled
  // Playwright run in tests/e2e/smoke.spec.ts ("offline reload and conversion").
  offline: 'full',
  requires: [],
  icon: ImageUp
};
