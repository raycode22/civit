/**
 * [NEW] Browser-capability detection with clear user-facing error messages
 * (PRD FR-26, FR-32). Detection is side-effect free and accepts an injected
 * scope so it is unit-testable outside a browser.
 */

export type CapabilityKey =
  | 'wasm'
  | 'worker'
  | 'clipboard'
  | 'microphone'
  | 'screen'
  | 'storage'
  | 'service-worker'
  | 'secure-context';

export type Capabilities = Record<CapabilityKey, boolean>;

/** Minimal structural view of the bits we probe (kept narrow for testability). */
export interface CapabilityScope {
  WebAssembly?: { instantiate: unknown } | undefined;
  Worker?: unknown;
  navigator?:
    | {
        clipboard?: unknown;
        getUserMedia?: unknown;
        mediaDevices?: { getUserMedia?: unknown; getDisplayMedia?: unknown } | undefined;
        storage?: { estimate?: unknown } | undefined;
        serviceWorker?: unknown;
      }
    | undefined;
  isSecureContext?: boolean | undefined;
}

function resolveSecureContext(scope: CapabilityScope): boolean {
  if (typeof scope.isSecureContext === 'boolean') return scope.isSecureContext;
  // No injected value (e.g. older environment): fall back to a same-origin
  // heuristic that only claims "secure" on localhost/https.
  if (typeof location === 'undefined') return false;
  return location.protocol === 'https:' || location.hostname === 'localhost';
}

/** Probe the given scope (defaults to `globalThis`) for each capability. */
export function detectCapabilities(scope: CapabilityScope = globalThis): Capabilities {
  const nav = scope.navigator;
  return {
    wasm: typeof scope.WebAssembly?.instantiate === 'function',
    worker: typeof scope.Worker === 'function',
    clipboard: !!(nav?.clipboard && resolveSecureContext(scope)),
    microphone: !!(nav?.mediaDevices?.getUserMedia && resolveSecureContext(scope)),
    screen: !!(nav?.mediaDevices?.getDisplayMedia && resolveSecureContext(scope)),
    storage: typeof nav?.storage?.estimate === 'function',
    'service-worker': !!nav?.serviceWorker,
    'secure-context': resolveSecureContext(scope)
  };
}

/**
 * User-facing messages for missing capabilities. Secure-context wording
 * documents the Docker/Podman plain-HTTP-on-LAN failure mode (PRD FR-32).
 */
export const CAPABILITY_MESSAGES: Record<CapabilityKey, string> = {
  wasm: 'WebAssembly is unavailable in this browser, so this tool cannot run.',
  worker: 'Web Workers are unavailable, so this tool will run more slowly.',
  clipboard:
    'Clipboard access needs a secure context (HTTPS or localhost). Reconnect securely and try again.',
  microphone:
    'Microphone access needs a secure context (HTTPS or localhost). Reconnect securely and try again.',
  screen:
    'Screen capture needs a secure context (HTTPS or localhost). Reconnect securely and try again.',
  storage: 'Browser storage is unavailable, so offline assets cannot be saved in this session.',
  'service-worker':
    'Offline support is unavailable in this browser or context, so this tool needs a connection.',
  'secure-context':
    'This page is not a secure context (HTTPS or localhost). Some features — microphone, screen capture, clipboard, and offline support — will not work here.'
};

/**
 * Combine the messages for every missing capability into one user-facing
 * string, or `null` when nothing relevant is missing.
 */
export function missingCapabilityMessage(
  keys: CapabilityKey[],
  capabilities: Capabilities
): string | null {
  const missing = keys.filter((key) => !capabilities[key]);
  if (missing.length === 0) return null;
  return missing.map((key) => CAPABILITY_MESSAGES[key]).join(' ');
}
