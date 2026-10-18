/**
 * [NEW] Minimal, dependency-free ZIP writer for multi-file tool output
 * (PRD FR-26). Uses the "store" method (no compression), which is valid ZIP
 * and ideal for already-compressed formats (PNG/JPEG/WebP/…) and text files.
 * Output is a standard archive readable by common unzip tools.
 */

export interface ZipEntry {
  /** File name inside the archive (UTF-8; sub-paths allowed, e.g. `tiles/1.png`). */
  name: string;
  data: Uint8Array;
}

/** CRC-32 (IEEE 802.3 polynomial), built lazily. */
let crcTable: Uint32Array | undefined;

function getCrcTable(): Uint32Array {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[i] = c >>> 0;
    }
  }
  return crcTable;
}

/** Compute the CRC-32 of a byte array. */
export function crc32(data: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** MS-DOS date/time pair (ZIP's native timestamp format). */
function dosDateTime(now: Date): { time: number; date: number } {
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const year = Math.max(1980, now.getFullYear());
  const date = ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  return { time, date };
}

/** Concatenate byte arrays into one buffer. */
function concat(chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const chunk of chunks) total += chunk.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

const encoder = new TextEncoder();

/**
 * Build a ZIP archive from the given entries (store method).
 * `now` is injectable for deterministic tests.
 */
export function createZip(entries: ZipEntry[], now: Date = new Date()): Uint8Array {
  if (entries.length === 0) throw new Error('A ZIP archive requires at least one entry');
  const { time, date } = dosDateTime(now);
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    if (nameBytes.length === 0) throw new Error('ZIP entry names must not be empty');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header + name + data.
    const local = new Uint8Array(30 + nameBytes.length + size);
    const lv = new DataView(local.buffer, local.byteOffset, local.byteLength);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // flags: UTF-8 names
    lv.setUint16(8, 0, true); // method: store
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // compressed size
    lv.setUint32(22, size, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    local.set(nameBytes, 30);
    local.set(entry.data, 30 + nameBytes.length);
    locals.push(local);

    // Central directory header + name.
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer, central.byteOffset, central.byteLength);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0x0800, true); // flags: UTF-8 names
    cv.setUint16(10, 0, true); // method: store
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true); // local header offset
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);

  // End of central directory record.
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // signature
  ev.setUint16(8, entries.length, true); // entries on this disk
  ev.setUint16(10, entries.length, true); // total entries
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true); // central directory offset

  return concat([...locals, ...centrals, eocd]);
}
