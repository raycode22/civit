import { describe, it, expect } from 'vitest';
import {
  MAX_FILE_BYTES,
  validateImage,
  inferMimeFromName,
  buildDataUri,
  encodeBytes,
  formatBytes
} from '$tools/base64-image-encoder/logic';

describe('validateImage', () => {
  it('accepts a normal-sized PNG', () => {
    expect(validateImage({ size: 1024, type: 'image/png' })).toBeNull();
  });

  it('rejects empty files', () => {
    expect(validateImage({ size: 0, type: 'image/png' })).toEqual({ code: 'empty' });
  });

  it('rejects files larger than the maximum', () => {
    const err = validateImage({ size: MAX_FILE_BYTES + 1, type: 'image/png' });
    expect(err).toEqual({ code: 'too-large', bytes: MAX_FILE_BYTES + 1 });
  });

  it('accepts files exactly at the maximum size', () => {
    expect(validateImage({ size: MAX_FILE_BYTES, type: 'image/jpeg' })).toBeNull();
  });

  it('rejects unsupported MIME types', () => {
    expect(validateImage({ size: 10, type: 'application/pdf' })).toEqual({
      code: 'unsupported-type',
      mime: 'application/pdf'
    });
  });

  it('rejects unknown/empty MIME types', () => {
    expect(validateImage({ size: 10, type: '' })).toEqual({
      code: 'unsupported-type',
      mime: 'unknown'
    });
  });
});

describe('inferMimeFromName', () => {
  it('maps common image extensions', () => {
    expect(inferMimeFromName('photo.PNG')).toBe('image/png');
    expect(inferMimeFromName('a.jpg')).toBe('image/jpeg');
    expect(inferMimeFromName('a.jpeg')).toBe('image/jpeg');
    expect(inferMimeFromName('a.gif')).toBe('image/gif');
    expect(inferMimeFromName('a.webp')).toBe('image/webp');
    expect(inferMimeFromName('a.svg')).toBe('image/svg+xml');
    expect(inferMimeFromName('a.avif')).toBe('image/avif');
    expect(inferMimeFromName('a.bmp')).toBe('image/bmp');
  });

  it('returns empty string for unknown extensions', () => {
    expect(inferMimeFromName('file.txt')).toBe('');
    expect(inferMimeFromName('noextension')).toBe('');
  });
});

describe('buildDataUri', () => {
  it('builds a data URI and reports the encoded size', () => {
    const r = buildDataUri('image/png', 'aGVsbG8=');
    expect(r.dataUri).toBe('data:image/png;base64,aGVsbG8=');
    expect(r.sizeBase64).toBe('aGVsbG8='.length);
  });

  it('strips whitespace from base64 payloads', () => {
    const r = buildDataUri('image/png', 'aGVs\nbG8\t= ');
    expect(r.dataUri).toBe('data:image/png;base64,aGVsbG8=');
  });

  it('throws on invalid base64 characters', () => {
    expect(() => buildDataUri('image/png', 'not*base64!')).toThrow(/Invalid Base64/);
  });
});

/** Decode a base64 string (no prefix) back to bytes, without Node globals. */
function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

describe('encodeBytes', () => {
  it('encodes a Uint8Array to the expected data URI', () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG signature prefix
    const r = encodeBytes('image/png', bytes);
    expect(r.dataUri).toBe('data:image/png;base64,iVBORw==');
  });

  it('round-trips through base64 decoding', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5, 250, 251, 252, 253, 254, 255]);
    const r = encodeBytes('image/jpeg', bytes);
    const decoded = decodeBase64(r.dataUri.split(',')[1]);
    expect(Array.from(decoded)).toEqual(Array.from(bytes));
  });

  it('accepts an ArrayBuffer as well', () => {
    const buf = new Uint8Array([65, 66, 67]).buffer; // "ABC"
    const r = encodeBytes('image/gif', buf);
    expect(r.dataUri).toBe('data:image/gif;base64,QUJD');
  });

  it('handles input larger than one encoding chunk', () => {
    const big = new Uint8Array(0x8000 * 2 + 7).fill(0xab);
    const r = encodeBytes('image/png', big);
    const decoded = decodeBase64(r.dataUri.split(',')[1]);
    expect(decoded.length).toBe(big.length);
    expect(decoded.every((v: number) => v === 0xab)).toBe(true);
  });
});

describe('formatBytes', () => {
  it('formats byte sizes across units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(100 * 1024)).toBe('100 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB');
    expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe('5.0 GB');
  });
});
