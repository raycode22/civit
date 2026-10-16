import { ImageUp } from '@lucide/svelte';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64-image-encoder',
  name: 'Base64 Image Encoder',
  description: 'Convert an image file into a Base64 data URI, entirely in your browser.',
  keywords: ['base64', 'image', 'data uri', 'encode', 'decoder', 'dataurl'],
  category: 'encoder',
  offlineCapable: true,
  icon: ImageUp
};
