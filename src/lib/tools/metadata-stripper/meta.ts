import { FileMinus } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/**
 * [Phase A, tag: L] Images & Assets. A lightweight Canvas 2D tool that
 * strips metadata (EXIF, ICC profile, etc.) from an image file.
 * PRD §12 catalog: Images & Assets, tag [L].
 */
export const meta: ToolMeta = {
  id: 'metadata-stripper',
  name: 'Metadata Stripper',
  description: 'Remove EXIF and other metadata from an image, entirely in your browser.',
  keywords: ['metadata', 'exif', 'strip', 'remove', 'privacy', 'image', 'scrub'],
  category: 'images-assets',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: FileMinus
};
