// Prompt 3C — URL Encoder tool core tests. Verifies platform encodeURIComponent
// semantics and tolerant decoding of malformed percent sequences (no throws).
import { describe, expect, it } from 'vitest';
import { encodeComponent, decodeComponent } from '../src/lib/text/urlCodec';

describe('encodeComponent', () => {
  it('follows encodeURIComponent semantics', () => {
    expect(encodeComponent('hello world')).toEqual({ ok: true, output: 'hello%20world' });
    expect(encodeComponent('a=b&c')).toEqual({ ok: true, output: 'a%3Db%26c' });
    expect(encodeComponent('keep-this_safe~dot')).toEqual({ ok: true, output: 'keep-this_safe~dot' });
  });

  it('percent-encodes non-ASCII as UTF-8 byte escapes', () => {
    expect(encodeComponent('café')).toEqual({ ok: true, output: 'caf%C3%A9' });
    expect(encodeComponent('🚀')).toEqual({ ok: true, output: '%F0%9F%9A%80' });
  });

  it('empty input encodes to empty output', () => {
    expect(encodeComponent('')).toEqual({ ok: true, output: '' });
  });

  it('reports lone surrogates with an actionable error instead of throwing', () => {
    const res = encodeComponent('\uD800lone'); // unpaired high surrogate
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('surrogate');
  });
});

describe('decodeComponent', () => {
  it('decodes well-formed percent-encoding in one pass', () => {
    expect(decodeComponent('hello%20world')).toEqual({ ok: true, output: 'hello world' });
    expect(decodeComponent('caf%C3%A9')).toEqual({ ok: true, output: 'café' });
  });

  it('round-trips through encodeComponent', () => {
    for (const sample of ['a b&c=d?e#f', '日本語 text 🎉', '+/%=', 'plain']) {
      const enc = encodeComponent(sample);
      expect(enc.ok).toBe(true);
      if (enc.ok) {
        const dec = decodeComponent(enc.output);
        expect(dec).toEqual({ ok: true, output: sample });
      }
    }
  });

  it('leaves malformed sequences verbatim and warns (never throws)', () => {
    const res = decodeComponent('a%zzb%');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toBe('a%zzb%');
      expect(res.warning).toContain('malformed');
    }
  });

  it('keeps a trailing partial escape', () => {
    const res = decodeComponent('100%');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toBe('100%');
      expect(res.warning).toBeDefined();
    }
  });

  it('handles truncated multi-byte escapes without crashing', () => {
    const res = decodeComponent('%E0%A4'); // incomplete 3-byte sequence
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output).toBe('%E0%A4');
  });

  it('empty input decodes to empty output', () => {
    expect(decodeComponent('')).toEqual({ ok: true, output: '' });
  });
});
