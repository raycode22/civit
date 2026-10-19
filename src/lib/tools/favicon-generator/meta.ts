import { Gamepad2 } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/**
 * [Phase A, tag: L] Images & Assets. A lightweight pure-JS tool that
 * generates a favicon from a text name via Canvas 2D.
 * PRD §12 catalog: Images & Assets, tag [L].
 */
export const meta: ToolMeta = {
  id: 'favicon-generator',
  name: 'Favicon Generator',
  description: 'Turn a short text name into a favicon (ICO/PNG) using Canvas 2D.',
  keywords: ['favicon', 'icon', 'logo', 'canvas', 'ico', 'png', 'favicon-generator'],
  category: 'images-assets',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: Gamepad2
};
