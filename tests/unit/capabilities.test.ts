import { describe, it, expect } from 'vitest';
import {
  detectCapabilities,
  missingCapabilityMessage,
  CAPABILITY_MESSAGES,
  type CapabilityScope
} from '$lib/capabilities';

/** A fully-capable, secure scope (e.g. Chrome on HTTPS). */
const fullScope: CapabilityScope = {
  WebAssembly: { instantiate: () => Promise.resolve() },
  Worker: class {},
  isSecureContext: true,
  navigator: {
    clipboard: { writeText: () => Promise.resolve() },
    mediaDevices: {
      getUserMedia: () => Promise.resolve(),
      getDisplayMedia: () => Promise.resolve()
    },
    storage: { estimate: () => Promise.resolve({ quota: 0, usage: 0 }) },
    serviceWorker: { register: () => Promise.resolve() }
  }
};

/** Plain-HTTP over a LAN IP: APIs exist but the context is insecure. */
const insecureScope: CapabilityScope = {
  WebAssembly: fullScope.WebAssembly,
  Worker: fullScope.Worker,
  isSecureContext: false,
  navigator: {
    clipboard: { writeText: () => Promise.resolve() },
    mediaDevices: {
      getUserMedia: () => Promise.resolve(),
      getDisplayMedia: () => Promise.resolve()
    },
    storage: fullScope.navigator?.storage
  }
};

describe('detectCapabilities', () => {
  it('reports everything available on a capable secure scope', () => {
    const caps = detectCapabilities(fullScope);
    expect(caps).toEqual({
      wasm: true,
      worker: true,
      clipboard: true,
      microphone: true,
      screen: true,
      storage: true,
      'service-worker': true,
      'secure-context': true
    });
  });

  it('marks secure-context features unavailable on plain HTTP', () => {
    const caps = detectCapabilities(insecureScope);
    expect(caps['secure-context']).toBe(false);
    expect(caps.clipboard).toBe(false);
    expect(caps.microphone).toBe(false);
    expect(caps.screen).toBe(false);
    // Non-context features still work.
    expect(caps.wasm).toBe(true);
    expect(caps.worker).toBe(true);
    expect(caps.storage).toBe(true);
  });

  it('handles a scope with no navigator (e.g. restricted runtimes)', () => {
    const caps = detectCapabilities({
      WebAssembly: fullScope.WebAssembly,
      Worker: fullScope.Worker,
      isSecureContext: true
    });
    expect(caps.wasm).toBe(true);
    expect(caps.clipboard).toBe(false);
    expect(caps.storage).toBe(false);
  });

  it('detects missing WebAssembly and Worker', () => {
    const caps = detectCapabilities({ isSecureContext: true, navigator: {} });
    expect(caps.wasm).toBe(false);
    expect(caps.worker).toBe(false);
    expect(caps['service-worker']).toBe(false);
  });

  it('detects service-worker support independently of secure context', () => {
    const caps = detectCapabilities({
      isSecureContext: false,
      navigator: { serviceWorker: { register: () => Promise.resolve() } }
    });
    // The API can exist even on an insecure origin (registration itself may
    // still be refused; this probe only reports API availability).
    expect(caps['service-worker']).toBe(true);
    expect(caps['secure-context']).toBe(false);
  });
});

describe('missingCapabilityMessage', () => {
  it('returns null when nothing is missing', () => {
    const caps = detectCapabilities(fullScope);
    expect(missingCapabilityMessage(['clipboard', 'microphone'], caps)).toBeNull();
  });

  it('joins messages for each missing capability', () => {
    const caps = detectCapabilities(insecureScope);
    const msg = missingCapabilityMessage(['clipboard', 'secure-context'], caps);
    expect(msg).toContain(CAPABILITY_MESSAGES.clipboard);
    expect(msg).toContain(CAPABILITY_MESSAGES['secure-context']);
  });

  it('mentions HTTPS/localhost for insecure-context failures (FR-32)', () => {
    const caps = detectCapabilities(insecureScope);
    const msg = missingCapabilityMessage(['microphone'], caps);
    expect(msg).toMatch(/HTTPS or localhost/);
  });
});
