import type { Component } from 'svelte';

/**
 * [REVISED per PRD FR-21] The three in-scope catalog categories.
 * Other categories are out of scope for this increment.
 */
export type ToolCategory = 'images-assets' | 'audio-video' | 'typography-text';

/** [NEW] Lifecycle status shown as a badge (PRD FR-21). */
export type ToolStatus = 'new' | 'beta' | 'stable';

/**
 * [NEW] Declared offline support (PRD FR-21):
 * - `full`: every asset needed for all advertised functions is local;
 *   only set after a network-disabled verification run (PRD FR-30).
 * - `partial`: core functions run offline; some assets may still need a
 *   one-time download.
 * - `online-only`: not usable without the network (also the safe value
 *   for tools whose verification has not happened yet).
 */
export type OfflineSupport = 'full' | 'partial' | 'online-only';

/** [NEW] Extra capabilities a tool needs beyond plain JS (PRD FR-21). */
export type ToolRequirement = 'wasm' | 'ml-model' | 'camera-mic-screen' | 'clipboard';

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
  /** Catalog category (one of the three in-scope categories). */
  category: ToolCategory;
  /** Lifecycle status badge. */
  status: ToolStatus;
  /** Declared offline support; see {@link OfflineSupport}. */
  offline: OfflineSupport;
  /** Capabilities required beyond plain JS; empty array when none. */
  requires: ToolRequirement[];
  /** Icon component rendered on the tool card (lucide-svelte component). */
  icon: Component;
}

/** A fully-registered tool: metadata plus its UI component loader. */
export interface Tool extends ToolMeta {
  /**
   * [REVISED] Lazy loader for the tool's UI. The tool's chunk (and any
   * heavy libraries it imports) is fetched only when its route opens
   * (PRD FR-24), so the initial bundle stays small.
   */
  component: () => Promise<{ default: Component }>;
}
