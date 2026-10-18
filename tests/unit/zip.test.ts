import { describe, it, expect } from 'vitest';
import { createZip, crc32 } from '$lib/io/zip';

function ascii(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Minimal EOCD reader for round-trip assertions. */
function readEOCD(zip: Uint8Array): { count: number; centralSize: number; centralOffset: number } {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  // EOCD is 22 bytes at the end (no comment in our writer).
  const eocd = zip.length - 22;
  expect(view.getUint32(eocd, true)).toBe(0x06054b50);
  return {
    count: view.getUint16(eocd + 10, true),
    centralSize: view.getUint32(eocd + 12, true),
    centralOffset: view.getUint32(eocd + 16, true)
  };
}

describe('crc32', () => {
  it('matches the known IEEE vector for "123456789"', () => {
    expect(crc32(ascii('123456789'))).toBe(0xcbf43926);
  });

  it('returns 0 for empty input', () => {
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
});

describe('createZip', () => {
  const now = new Date(2024, 0, 2, 3, 4, 6); // fixed timestamp for determinism

  it('rejects an empty entry list', () => {
    expect(() => createZip([])).toThrow(/at least one entry/);
  });

  it('rejects empty entry names', () => {
    expect(() => createZip([{ name: '', data: ascii('x') }], now)).toThrow(/must not be empty/);
  });

  it('produces a valid archive with local headers and an EOCD', () => {
    const zip = createZip([{ name: 'a.txt', data: ascii('hello') }], now);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    expect(view.getUint32(0, true)).toBe(0x04034b50); // local file header signature
    const eocd = readEOCD(zip);
    expect(eocd.count).toBe(1);
    expect(eocd.centralOffset + eocd.centralSize).toBe(zip.length - 22);
  });

  it('round-trips multiple entries with byte-accurate data', () => {
    const entries = [
      { name: 'tiles/one.txt', data: ascii('first file') },
      { name: 'tiles/two.bin', data: new Uint8Array([0, 1, 2, 250, 251, 255]) }
    ];
    const zip = createZip(entries, now);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);

    let offset = 0;
    for (const entry of entries) {
      expect(view.getUint32(offset, true)).toBe(0x04034b50);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const size = view.getUint32(offset + 22, true);
      const nameStart = offset + 30;
      const name = new TextDecoder().decode(zip.subarray(nameStart, nameStart + nameLen));
      expect(name).toBe(entry.name);
      const dataStart = nameStart + nameLen + extraLen;
      const data = zip.subarray(dataStart, dataStart + size);
      expect(Array.from(data)).toEqual(Array.from(entry.data));
      // CRC in the local header must match the payload.
      expect(view.getUint32(offset + 14, true)).toBe(crc32(entry.data));
      offset = dataStart + size;
    }
    expect(readEOCD(zip).count).toBe(2);
  });

  it('sets the UTF-8 name flag for non-ASCII names', () => {
    const zip = createZip([{ name: 'résumé.txt', data: ascii('x') }], now);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    expect(view.getUint16(6, true) & 0x0800).toBe(0x0800);
  });
});
