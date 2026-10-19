import { List } from '@lucide/svelte';
import type { ToolMeta } from '../types';

/**
 * [Phase A, tag: L] Typography & Text. A lightweight pure-JS tool
 * (Canvas/Web APIs / no external dependencies).
 * PRD §12 catalog: Typography & Text, tag [L].
 */
export const meta: ToolMeta = {
  id: 'word-counter',
  name: 'Word Counter',
  description: 'Count words, characters, sentences, and paragraphs in a text block.',
  keywords: ['word', 'count', 'character', 'sentence', 'paragraph', 'text', 'analyze'],
  category: 'typography-text',
  status: 'new',
  offline: 'full',
  requires: [],
  icon: List
};
