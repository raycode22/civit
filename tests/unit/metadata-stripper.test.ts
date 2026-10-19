/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import {
  MAX_FILE_BYTES,
  validateImage,
  inferMimeFromName,
  formatBytes
} from '$tools/metadata-stripper/logic';

describe('validateImage', () => {
  it('accepts a normal-sized PNG', () => {
    expect(validateImage({ size: 1024, type: 'image/png' })).toBeNull();
  });

  it('accepts a normal-sized JPEG', () => {
    expect(validateImage({ size: 1024, type: 'image/jpeg' })).toBeNull();
  });

  it('accepts a normal-sized WebP', () => {
    expect(validateImage({ size: 1024, type: 'image/webp' })).toBeNull();
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
    expect(inferMimeFromName('a.webp')).toBe('image/webp');
    expect(inferMimeFromName('a.gif')).toBe('image/gif');
    expect(inferMimeFromName('a.bmp')).toBe('image/bmp');
  });

  it('returns empty string for unknown extensions', () => {
    expect(inferMimeFromName('file.txt')).toBe('');
    expect(inferMimeFromName('noextension')).toBe('');
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
