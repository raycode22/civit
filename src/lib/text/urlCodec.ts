// Civit URL Encoder tool core — Phase 3, Prompt 3C.
// Pure logic; uses the platform APIs (encodeURIComponent/decodeURIComponent)
// as required by the build guide. All processing stays on the user's machine.
//
// Semantics:
// - Component mode percent-encodes a single URL component (space → %20),
//   matching encodeURIComponent exactly.
// - Decode mode is TOLERANT: malformed percent sequences (e.g. "%zz", "%2")
//   are left verbatim instead of throwing URIError — an actionable warning is
//   returned alongside the best-effort output.

export type UrlResult =
  | { ok: true; output: string; warning?: string }
  | { ok: false; error: string };

/** Encode one URL component (query value, path segment, fragment…). */
export function encodeComponent(text: string): UrlResult {
  if (text === '') {
    return { ok: true, output: '' };
  }
  try {
    return { ok: true, output: encodeURIComponent(text) };
  } catch {
    // Lone surrogates throw URIError in encodeURIComponent.
    return { ok: false, error: 'This text contains isolated surrogate characters that cannot be percent-encoded. Remove them and try again.' };
  }
}

/**
 * Decode percent-encoded text. Never throws: malformed sequences are kept
 * literally and reported via `warning`.
 */
export function decodeComponent(text: string): UrlResult {
  if (text === '') {
    return { ok: true, output: '' };
  }
  // Fast path: well-formed input decodes in one platform-API call.
  try {
    return { ok: true, output: decodeURIComponent(text) };
  } catch {
    // fall through to tolerant per-sequence decoding
  }
  let decoded = '';
  let malformedCount = 0;
  const re = /%[0-9A-Fa-f]{2}|%[^0-9A-Fa-f]?|[^%]+/gu;
  // Walk the string in segments so bad escapes survive untouched. Multi-byte
  // UTF-8 sequences split across separate %XX groups decode correctly here
  // because each valid group is passed to decodeURIComponent individually.
  for (const part of text.match(re) ?? []) {
    if (part.startsWith('%')) {
      try {
        decoded += decodeURIComponent(part);
      } catch {
        malformedCount++;
        decoded += part;
      }
    } else {
      decoded += part;
    }
  }
  const result: UrlResult = { ok: true, output: decoded };
  if (malformedCount > 0) {
    result.warning = `${malformedCount} malformed percent sequence${malformedCount === 1 ? '' : 's'} (like "%zz" or a trailing "%2") could not be decoded and ${malformedCount === 1 ? 'was' : 'were'} left unchanged.`;
  }
  return result;
}
