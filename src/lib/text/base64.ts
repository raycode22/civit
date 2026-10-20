// Civit Base64 tool core — Phase 3, Prompt 3C.
// Pure logic (TextEncoder/TextDecoder are global in Node ≥18 and browsers),
// unit-testable without hydration. All processing stays on the user's machine.
//
// Build-guide requirement: UTF-8 text is converted through an explicit
// TextEncoder → binary-string → btoa layer (and the reverse for decoding).
// Raw btoa/atob on non-Latin1 strings is binary-unsafe and NOT used directly.
//
// Constitution note surfaced in the UI: Base64 is an ENCODING, not encryption.

/** Maximum accepted input size in characters (input guardrail). */
export const MAX_B64_INPUT_CHARS = 2_000_000;

export type CodecResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

const B64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/** Encode arbitrary UTF-8 text to standard Base64 (with padding). */
export function encodeBase64(text: string): CodecResult {
  if (text.length > MAX_B64_INPUT_CHARS) {
    return { ok: false, error: `Input too large (${text.length.toLocaleString()} characters). Limit: ${MAX_B64_INPUT_CHARS.toLocaleString()}.` };
  }
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    // Chunked to avoid arg-limit issues on very large inputs.
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { ok: true, output: btoa(binary) };
  } catch {
    return { ok: false, error: 'Encoding failed unexpectedly. Please shorten the input and try again.' };
  }
}

/**
 * Decode standard Base64 back to UTF-8 text.
 * Produces actionable errors (never throws) for malformed input.
 */
export function decodeBase64(encoded: string): CodecResult {
  const cleaned = encoded.replace(/\s/g, '');
  if (cleaned === '') {
    return { ok: false, error: 'Nothing to decode — the input is empty.' };
  }
  if (cleaned.length > MAX_B64_INPUT_CHARS) {
    return { ok: false, error: `Input too large (${cleaned.length.toLocaleString()} characters). Limit: ${MAX_B64_INPUT_CHARS.toLocaleString()}.` };
  }
  if (cleaned.length % 4 !== 0) {
    return {
      ok: false,
      error: `Invalid Base64 length (${cleaned.length} characters after removing whitespace). Standard Base64 comes in groups of 4; add/remove padding or check for truncated input.`,
    };
  }
  if (!B64_RE.test(cleaned)) {
    const bad = cleaned.match(/[^A-Za-z0-9+/=]/);
    const where = bad && bad.index !== undefined ? bad.index + 1 : undefined;
    return {
      ok: false,
      error: `Invalid Base64 character${where ? ` at position ${where}` : ''}. Allowed: A–Z, a–z, 0–9, +, / and up to two trailing "=" padding characters. (URL-safe variants using - and _ must be converted first.)`,
    };
  }
  try {
    const binary = atob(cleaned);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    // fatal:true rejects invalid UTF-8 sequences with a clear error instead of U+FFFD.
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, output: text };
  } catch {
    return {
      ok: false,
      error: 'This decodes to bytes that are not valid UTF-8 text. It may be binary data or corrupted Base64.',
    };
  }
}
