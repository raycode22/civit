// Civit JSON Formatter core tests — Phase 3, Prompt 3A.
import { describe, expect, it } from 'vitest';

import {
  MAX_INPUT_CHARS,
  checkSizeGuard,
  formatJson,
  isBlank,
  lineColumnAt,
  minifyJson,
  toJsonError,
} from '../src/lib/tools/json';

describe('formatJson — valid inputs', () => {
  it('pretty-prints an object with 2-space indentation', () => {
    const res = formatJson('{"a":1,"b":[2,3]}');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
    }
  });

  it('minifies to a single line', () => {
    const res = minifyJson('{ "a" : 1 ,\n "b": [2, 3] }');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output).toBe('{"a":1,"b":[2,3]}');
  });

  it('accepts primitive JSON values', () => {
    for (const src of ['42', '"text"', 'true', 'false', 'null']) {
      const res = formatJson(src);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.output).toBe(JSON.parse(src) === null ? 'null' : JSON.stringify(JSON.parse(src)));
    }
  });

  it('preserves arrays at top level', () => {
    const res = formatJson('[1,2,{"x":"y"}]');
    expect(res.ok).toBe(true);
  });

  it('handles escaped strings and Unicode without corruption', () => {
    const tricky = '{"msg":"line\\nbreak \\"quoted\\"","emoji":"👩‍💻 ok","ünicode":"æøå"}';
    const res = formatJson(tricky);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // Round-trip: output must parse back to identical data.
      expect(JSON.parse(res.output)).toEqual(JSON.parse(tricky));
      expect(res.output).toContain('👩‍💻');
    }
  });

  it('supports custom indent width', () => {
    const res = formatJson('{"a":{"b":1}}', 4);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.output).toContain('\n    "a"');
  });
});

describe('formatJson / minifyJson — invalid inputs', () => {
  it('returns an accessible error for malformed JSON and never throws', () => {
    const res = formatJson('{"a": }');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.message.length).toBeGreaterThan(0);
  });

  it('rejects empty and whitespace-only input with a helpful message', () => {
    for (const blank of ['', '   ', '\n\t ']) {
      const res = formatJson(blank);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.message.toLowerCase()).toContain('empty');
      const min = minifyJson(blank);
      expect(min.ok).toBe(false);
    }
  });

  it('isBlank helper agrees', () => {
    expect(isBlank('  \n')).toBe(true);
    expect(isBlank('null')).toBe(false);
  });

  it('reports line/column only when reliably derivable (never invented)', () => {
    // Modern V8 style message includes explicit position.
    const err = new SyntaxError("Expected ',' or '}' after property value in JSON at position 6 (line 1 column 7)");
    const e = toJsonError(err, '{a:1,,}');
    expect(e.line).toBe(1);
    expect(e.column).toBe(7);

    // Legacy "at position N" style → computed from source text.
    const legacy = new SyntaxError('Unexpected number in JSON at position 9');
    const src = '{\n  "a": 1,\n  "b": 2xy\n}';
    const e2 = toJsonError(legacy, src);
    expect(e2.line).toBe(2);
    expect(e2.column).toBe(8); // offset 9 is the '"' on line 2 (col 8)

    // No position info at all → no fabricated location.
    const vague = new SyntaxError('Invalid JSON');
    const e3 = toJsonError(vague, 'nope');
    expect(e3.line).toBeUndefined();
    expect(e3.column).toBeUndefined();
  });

  it('lineColumnAt maps offsets correctly', () => {
    expect(lineColumnAt('abc', 0)).toEqual({ line: 1, column: 1 });
    expect(lineColumnAt('ab\ncd', 3)).toEqual({ line: 2, column: 1 });
    expect(lineColumnAt('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
    expect(lineColumnAt('ab', 99)).toEqual({ line: 1, column: 3 }); // clamped
  });
});

describe('size guardrail', () => {
  it('flags oversized input before parsing', () => {
    const huge = 'x'.repeat(MAX_INPUT_CHARS + 1);
    const guard = checkSizeGuard(huge);
    expect(guard).not.toBeNull();
    expect(guard!.ok).toBe(false);
    const res = formatJson(huge);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.message).toContain('too large');
  });

  it('allows input at exactly the limit shape (no off-by-one rejection)', () => {
    const atLimit = '"' + 'x'.repeat(MAX_INPUT_CHARS - 2) + '"'; // quoted string of exact length
    expect(atLimit.length).toBe(MAX_INPUT_CHARS);
    expect(checkSizeGuard(atLimit)).toBeNull();
  });
});
