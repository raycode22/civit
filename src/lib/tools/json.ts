// Civit JSON Formatter core — Phase 3, Prompt 3A (first vertical slice).
// Pure, browser-free logic so it is unit-testable without hydration.
// Constitution Article I: all processing happens here, in-memory, on the user's
// machine. Nothing is sent anywhere and nothing is persisted.
//
// Safety: uses ONLY native JSON.parse / JSON.stringify. Input is never executed
// (no eval, no Function(), no dynamic import of content).

/** Maximum accepted input size in characters (input guardrail; see PRD limits). */
export const MAX_INPUT_CHARS = 2_000_000; // ~2 MB of text

export interface JsonError {
  /** Human-readable message derived from the native SyntaxError. */
  message: string;
  /** 1-based line number, when reliably derivable. Never invented. */
  line?: number;
  /** 1-based column number within the line, when reliably derivable. */
  column?: number;
}

export type JsonResult =
  | { ok: true; output: string }
  | { ok: false; error: JsonError };

/**
 * Extract 1-based line/column from a V8 `JSON.parse` SyntaxError message like:
 *   'Unexpected token } in JSON at position 12'          (older)
 *   'Expected ',' or '}' after property value in JSON at position 12 (line 2 column 3)'  (Node 20+/Chromium 113+)
 * Only returns positions V8 actually reported; otherwise undefined (we do not invent locations).
 */
export function positionFromSyntaxError(err: SyntaxError): { line?: number; column?: number } {
  const msg = err.message ?? '';
  // Modern V8 includes explicit "(line N column M)".
  const direct = /\(line (\d+) column (\d+)\)/.exec(msg);
  if (direct) {
    return { line: Number(direct[1]), column: Number(direct[2]) };
  }
  // Older format: "at position P" — derive line/column from the raw text.
  const pos = /at position (\d+)/.exec(msg);
  if (pos) {
    return {}; // We cannot recompute reliably without the original text here; caller passes text.
  }
  return {};
}

/** Derive line/column for a character offset in `text` (offset is 0-based). */
export function lineColumnAt(text: string, offset: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  let lastBreak = -1;
  for (let i = 0; i < clamped; i++) {
    if (text[i] === '\n') {
      line++;
      lastBreak = i;
    }
  }
  return { line, column: clamped - lastBreak };
}

/** Parse error into a structured JsonError, using the original text for reliable positions. */
export function toJsonError(err: unknown, sourceText: string): JsonError {
  const message = err instanceof Error ? err.message : String(err);
  const modern = /\(line (\d+) column (\d+)\)/.exec(message);
  if (modern) {
    return { message, line: Number(modern[1]), column: Number(modern[2]) };
  }
  const legacy = /at position (\d+)/.exec(message);
  if (legacy) {
    const { line, column } = lineColumnAt(sourceText, Number(legacy[1]));
    return { message, line, column };
  }
  return { message };
}

/** Validate the size guardrail before parsing. */
export function checkSizeGuard(input: string): JsonResult | null {
  if (input.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: {
        message: `Input is too large (${input.length.toLocaleString()} characters). The limit is ${MAX_INPUT_CHARS.toLocaleString()} characters to keep processing responsive in your browser.`,
      },
    };
  }
  return null;
}

/** True when input is empty or whitespace-only. */
export function isBlank(input: string): boolean {
  return input.trim().length === 0;
}

/**
 * Format (pretty-print) JSON with 2-space indentation.
 * Empty/whitespace-only input → accessible error, input preserved by caller.
 */
export function formatJson(input: string, indentSpaces = 2): JsonResult {
  const guard = checkSizeGuard(input);
  if (guard) return guard;
  if (isBlank(input)) {
    return { ok: false, error: { message: 'Enter some JSON to format. The input is currently empty.' } };
  }
  try {
    const parsed: unknown = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, indentSpaces) };
  } catch (err) {
    return { ok: false, error: toJsonError(err, input) };
  }
}

/** Minify JSON to a single line. */
export function minifyJson(input: string): JsonResult {
  const guard = checkSizeGuard(input);
  if (guard) return guard;
  if (isBlank(input)) {
    return { ok: false, error: { message: 'Enter some JSON to minify. The input is currently empty.' } };
  }
  try {
    const parsed: unknown = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed) };
  } catch (err) {
    return { ok: false, error: toJsonError(err, input) };
  }
}

/**
 * Copy text to the clipboard via the async Clipboard API.
 * Returns false when unavailable/denied (caller announces failure accessibly).
 * Never logs or persists copied content.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
