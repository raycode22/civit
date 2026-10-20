// Prompt 3C — Base64 tool core tests. Covers UTF-8/non-ASCII handling,
// actionable malformed-input errors (never exceptions), round-trips, and the
// explicit UTF-8 conversion layer required by the build guide.
import { describe, expect, it } from 'vitest';
import { encodeBase64, decodeBase64 } from '../src/lib/text/base64';

describe('encodeBase64', () => {
  it('encodes ASCII correctly', () => {
    expect(encodeBase64('Man')).toEqual({ ok: true, output: 'TWFu' });
    expect(encodeBase64('Hi')).toEqual({ ok: true, output: 'SGk=' });
  });

  it('encodes non-ASCII via the UTF-8 layer (raw btoa would throw)', () => {
    // Known-good vectors proving an explicit UTF-8 conversion happens first:
    // 'café' → bytes 63 61 66 C3 A9 → 'Y2Fmw6k='; '日本語' → '5pel5pys6Kqe'.
    expect(encodeBase64('café')).toEqual({ ok: true, output: 'Y2Fmw6k=' });
    expect(encodeBase64('日本語')).toEqual({ ok: true, output: '5pel5pys6Kqe' });
    // Documented behavior note: Node's global atob/btoa are WHATWG-compliant
    // and accept non-Latin1 strings (unlike older browser btoa, which throws),
    // so the TextEncoder layer is required for correctness, not just to avoid
    // exceptions. Round-trip below proves byte-correct UTF-8 handling.
    const rt = decodeBase64(encodeBase64('héllo ✨ 日本語').output);
    expect(rt).toEqual({ ok: true, output: 'héllo ✨ 日本語' });
  });

  it('encodes empty string to empty output', () => {
    expect(encodeBase64('')).toEqual({ ok: true, output: '' });
  });

  it('rejects oversized input with an actionable error', () => {
    const huge = 'x'.repeat(2_000_001);
    const res = encodeBase64(huge);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('Input too large');
  });
});

describe('decodeBase64', () => {
  it('decodes standard padded Base64', () => {
    expect(decodeBase64('TWFu')).toEqual({ ok: true, output: 'Man' });
    expect(decodeBase64('SGk=')).toEqual({ ok: true, output: 'Hi' });
  });

  it('tolerates whitespace/newlines in pasted Base64', () => {
    // Two independently valid groups with whitespace between them.
    expect(decodeBase64('TWFu\n SGk=')).toEqual({ ok: true, output: 'ManHi' });
  });

  it('round-trips UTF-8 text including emoji and CJK', () => {
    const original = 'æøå ñ 中文 🚀‍🚀 mixed 123';
    const enc = encodeBase64(original);
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const dec = decodeBase64(enc.output);
      expect(dec).toEqual({ ok: true, output: original });
    }
  });

  it('reports invalid length as an actionable error (not an exception)', () => {
    const res = decodeBase64('QUJDRA'); // 6 chars, not multiple of 4
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('Invalid Base64 length');
  });

  it('reports invalid characters with position info', () => {
    const res = decodeBase64('QUJ$RA==');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Invalid Base64 character');
      expect(res.error).toContain('position 4');
    }
  });

  it('rejects URL-safe alphabet explicitly rather than silently accepting it', () => {
    const res = decodeBase64('Pz8_'); // contains '-'/'_' style URL-safe char
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('URL-safe');
  });

  it('errors clearly when valid Base64 is not valid UTF-8 text', () => {
    // '/wA=' decodes to bytes FF C0 00 — invalid UTF-8 sequence.
    const res = decodeBase64('/+AA');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('not valid UTF-8');
  });

  it('errors on empty input instead of returning empty success', () => {
    const res = decodeBase64('   ');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('empty');
  });
});
