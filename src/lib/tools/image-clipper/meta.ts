import { Crop } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/**
 * [Phase A, tag: L] Images & Assets. A lightweight Canvas 2D tool that
 * lets the user clip (crop) an image to a rectangle.
 * PRD §12 catalog: Images & Assets, tag [L].
 */
export const meta: ToolMeta = {
  id: 'image-clipper',
  name: 'Image Clipper',
  description: 'Upload an image, then clip it to a rectangle to extract the visible area.',
  keywords: ['crop', 'clip', 'image', 'cut', 'crop-image', 'clip-image', 'crop-image'],
  category: 'images-assets',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: Crop
};
