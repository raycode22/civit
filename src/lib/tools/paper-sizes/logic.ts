/** [NEW] Pure-JS reference data for paper sizes.
 *  Dimensions are in millimetres (ISO 216 / ANSI / common custom), and
 *  aspect ratios are given as width : height.
 */

export interface PaperSize {
  /** ISO name (e.g. A4, B5) or 'Letter'/'Legal'/'Tabloid'. */
  id: string;
  /** Width in mm. */
  widthMm: number;
  /** Height in mm. */
  heightMm: number;
  /** Aspect ratio as a string, e.g. '1 : 1.414'. */
  aspect: string;
  /** Long edge in mm. */
  longEdgeMm: number;
  /** Short edge in mm. */
  shortEdgeMm: number;
}

/** ISO 216 paper sizes (A, B, C series). */
export const ISO_PAPER_SIZES: readonly PaperSize[] = [
  {
    id: 'A0',
    widthMm: 841,
    heightMm: 1189,
    aspect: '1 : 1.414',
    longEdgeMm: 1189,
    shortEdgeMm: 841
  },
  { id: 'A1', widthMm: 594, heightMm: 841, aspect: '1 : 1.414', longEdgeMm: 841, shortEdgeMm: 594 },
  { id: 'A2', widthMm: 420, heightMm: 594, aspect: '1 : 1.414', longEdgeMm: 594, shortEdgeMm: 420 },
  { id: 'A3', widthMm: 297, heightMm: 420, aspect: '1 : 1.414', longEdgeMm: 420, shortEdgeMm: 297 },
  { id: 'A4', widthMm: 210, heightMm: 297, aspect: '1 : 1.414', longEdgeMm: 297, shortEdgeMm: 210 },
  { id: 'A5', widthMm: 148, heightMm: 210, aspect: '1 : 1.414', longEdgeMm: 210, shortEdgeMm: 148 },
  { id: 'A6', widthMm: 105, heightMm: 148, aspect: '1 : 1.414', longEdgeMm: 148, shortEdgeMm: 105 },
  { id: 'B4', widthMm: 250, heightMm: 353, aspect: '1 : 1.414', longEdgeMm: 353, shortEdgeMm: 250 },
  { id: 'B5', widthMm: 176, heightMm: 250, aspect: '1 : 1.414', longEdgeMm: 250, shortEdgeMm: 176 },
  { id: 'C4', widthMm: 229, heightMm: 324, aspect: '1 : 1.414', longEdgeMm: 324, shortEdgeMm: 229 },
  { id: 'C5', widthMm: 162, heightMm: 229, aspect: '1 : 1.414', longEdgeMm: 229, shortEdgeMm: 162 }
];

/** Common North American sizes. */
export const NORTH_AMERICAN_SIZES: readonly PaperSize[] = [
  {
    id: 'Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    aspect: '1 : 1.294',
    longEdgeMm: 279.4,
    shortEdgeMm: 215.9
  },
  {
    id: 'Legal',
    widthMm: 215.9,
    heightMm: 355.6,
    aspect: '1 : 1.648',
    longEdgeMm: 355.6,
    shortEdgeMm: 215.9
  },
  {
    id: 'Tabloid',
    widthMm: 279.4,
    heightMm: 431.8,
    aspect: '1 : 1.545',
    longEdgeMm: 431.8,
    shortEdgeMm: 279.4
  }
];

/** Custom sizes relevant to offset and digital print. */
export const CUSTOM_SIZES: readonly PaperSize[] = [
  {
    id: 'A4+ (Extra Large)',
    widthMm: 235.5,
    heightMm: 324.0,
    aspect: '1 : 1.376',
    longEdgeMm: 324.0,
    shortEdgeMm: 235.5
  },
  {
    id: 'A3+ (A3 Extra)',
    widthMm: 329.0,
    heightMm: 460.0,
    aspect: '1 : 1.402',
    longEdgeMm: 460.0,
    shortEdgeMm: 329.0
  },
  {
    id: 'Super A3',
    widthMm: 320.0,
    heightMm: 440.0,
    aspect: '1 : 1.375',
    longEdgeMm: 440.0,
    shortEdgeMm: 320.0
  }
];

/** All reference paper sizes. */
export const PAPER_SIZES: readonly PaperSize[] = [
  ...ISO_PAPER_SIZES,
  ...NORTH_AMERICAN_SIZES,
  ...CUSTOM_SIZES
];

/** Find a paper size by id (case-insensitive). */
export function findPaperSize(id: string): PaperSize | undefined {
  return PAPER_SIZES.find((size) => size.id.toLowerCase() === id.toLowerCase());
}

/** Format a dimension as `210 × 297 mm`. */
export function formatDimensions(widthMm: number, heightMm: number): string {
  return `${widthMm} × ${heightMm} mm`;
}
