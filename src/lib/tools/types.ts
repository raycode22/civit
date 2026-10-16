import type { Component } from 'svelte';

/** Category under which a tool is grouped in the catalog. */
export type ToolCategory = 'converter' | 'encoder' | 'text' | 'developer';

/** Static metadata describing a Civit tool. */
export interface ToolMeta {
  /** URL-safe unique identifier, used for the `/tools/[id]` route. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Short one-line description shown on cards and search results. */
  description: string;
  /** Keywords that improve search recall. */
  keywords: string[];
  /** Catalog category. */
  category: ToolCategory;
  /** Whether the tool is verified to work with the network disabled. */
  offlineCapable: boolean;
  /** Icon component rendered on the tool card (lucide-svelte component). */
  icon?: Component;
}

/** A fully-registered tool: metadata plus its UI component. */
export interface Tool extends ToolMeta {
  /** The tool's page component. */
  component: Component;
}
