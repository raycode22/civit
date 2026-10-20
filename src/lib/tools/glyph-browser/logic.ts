/** [NEW] Pure-JS glyph browser logic.
 *  Requires a loaded `FontFace`/canvas context to enumerate glyphs.
 *  Throws if no font is active, so the UI keeps a clear error message.
 */

/** A single glyph as returned by the font enumeration. */
export interface Glyph {
  /** Unicode code point. */
  code: number;
  /** Character (16-bit safe). */
  char: string;
  /** Unicode name, if the font provides one. */
  name: string;
  /** Horizontal advance width (CSS px). */
  advance: number;
}

/** Ordered ranges of Unicode code points that are commonly useful for
 *  glyph browsing. Each entry is inclusive on both ends. */
export const UNICODE_RANGES: readonly { label: string; start: number; end: number }[] = [
  { label: 'Basic Latin', start: 0x0000, end: 0x007f },
  { label: 'Latin-1 Supplement', start: 0x0080, end: 0x00ff },
  { label: 'Latin Extended-A', start: 0x0100, end: 0x017f },
  { label: 'Latin Extended-B', start: 0x0180, end: 0x024f },
  { label: 'Greek', start: 0x0370, end: 0x03ff },
  { label: 'Cyrillic', start: 0x0400, end: 0x04ff },
  { label: 'Arabic', start: 0x0600, end: 0x06ff },
  { label: 'CJK Symbols and Punctuation', start: 0x3000, end: 0x303f },
  { label: 'CJK Unified Ideographs', start: 0x4e00, end: 0x9fff }
];

/** Return the glyphs for an active font by measuring each code point. */
export async function enumerateGlyphs(
  font: FontFace,
  ranges: typeof UNICODE_RANGES,
  ctx: CanvasRenderingContext2D
): Promise<Glyph[]> {
  await font.load();
  ctx.font = `64px '${font.family}', sans-serif`;

  const glyphs: Glyph[] = [];
  for (const range of ranges) {
    for (let code = range.start; code <= range.end; code++) {
      const char = String.fromCodePoint(code);
      const measured = ctx.measureText(char);
      glyphs.push({
        code,
        char,
        name: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
        advance: measured.width
      });
    }
  }
  return glyphs;
}

/** Filter glyphs by a simple text query. */
export function filterGlyphs(glyphs: Glyph[], query: string): Glyph[] {
  const q = query.trim().toLowerCase();
  if (!q) return glyphs;
  return glyphs.filter((g) => g.name.toLowerCase().includes(q) || g.char.toLowerCase().includes(q));
}

/** Limit the returned glyphs to the first `limit` items. */
export function take<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}
