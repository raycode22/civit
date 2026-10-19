/**
 * [Stage 9A, FR-40] Target-aware RUNTIME URL audit.
 *
 * Scans a build output directory for absolute http(s) URLs that appear in
 * genuinely fetch-capable syntactic positions and verifies the set of
 * external origins against the policy for the selected delivery target:
 *
 *   - `--target=online`  Only the approved Hugging Face Hub model origin
 *     (D-04) may appear in fetch position. Any other fetchable origin fails
 *     the audit.
 *   - `--target=docker`  No external runtime origin may appear in fetch
 *     position at all. The Docker image must be self-contained (D-05, D-07).
 *
 * URLs that appear only as inert strings (license banners, documentation
 * tables, Svelte runtime error-message doc links) are reported as
 * informational but never fail the audit: the browser never fetches them.
 * Fetch-capable positions checked per file type:
 *
 *   - HTML: src=, href=, srcset=, action=, poster=, data=, formaction=,
 *     xlink:href= attributes.
 *   - CSS: @import targets and url(...) targets (non-data: URLs only).
 *   - JS: string arguments to import(...), fetch(...), new URL(...),
 *     new Worker(...), new SharedWorker(...), new EventSource(...),
 *     navigator.serviceWorker.register(...), XMLHttpRequest.open(...), and
 *     .src = "..." / .href = "..." assignments holding an absolute URL.
 *     Bare string literals that merely mention a URL (error messages,
 *     markdown tables, license banners) are not fetch positions.
 *
 * XML namespace URIs (w3.org) are inert identifiers, never fetched, and are
 * always ignored.
 *
 * Implementation note: this scanner uses plain string scanning (startsWith,
 * indexOf, charCodeAt) with no regular-expression literals, so the check
 * logic is identical in every editor and shell without escaping surprises.
 *
 * Usage:
 *   node scripts/audit-runtime-urls.mjs [buildDir] --target=online|docker
 *
 * Defaults to `build/` when no directory is given.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith('--target='));
const buildDir = args.find((a) => !a.startsWith('--')) ?? 'build';
const target = targetArg ? targetArg.slice('--target='.length) : undefined;

if (target !== 'online' && target !== 'docker') {
  process.stderr.write(
    '[audit-runtime-urls] ERROR: --target=online or --target=docker is required.\n'
  );
  process.exit(2);
}

/**
 * Origins that are inert identifiers (XML namespaces) and are never fetched.
 */
const INERT_ORIGINS = new Set([
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/2001/XMLSchema',
  'http://www.w3.org/2001/XMLSchema-instance',
  'http://www.w3.org/2005/Atom'
]);

/**
 * Approved external origins per target (the online allowlist is D-04: the
 * only approved third-party runtime origin is Hugging Face Hub, for ML model
 * files). The Pages origin itself is same-origin and never appears as an
 * absolute URL in the output.
 */
const ALLOWED_ORIGINS = {
  online: new Set(['https://huggingface.co', 'https://cdn-lfs.huggingface.co']),
  docker: new Set()
};

/** File extensions considered part of the runtime output. */
const TEXT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.webmanifest',
  '.txt',
  '.svg',
  '.map',
  '.headers'
]);

const HTTP = 'http://';
const HTTPS = 'https://';
const URL_CHARS =
  "-._~:/?#[]@!$&'()*+,;=%0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function isUrlChar(ch) {
  return URL_CHARS.indexOf(ch) !== -1;
}

function isSpaceChar(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f';
}

function isQuote(ch) {
  return ch === "'" || ch === "'" || ch === '`';
}

function isIdentChar(ch) {
  const code = typeof ch === 'string' ? ch.charCodeAt(0) : -1;
  if (code >= 48 && code <= 57) return true;
  if (code >= 65 && code <= 90) return true;
  if (code >= 97 && code <= 122) return true;
  return ch === '_' || ch === '$';
}

function lowerAscii(s) {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    out += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : ch;
  }
  return out;
}

function matchWordI(text, pos, needle) {
  if (pos + needle.length > text.length) return -1;
  for (let k = 0; k < needle.length; k += 1) {
    const c = text.charCodeAt(pos + k);
    const lower = c >= 65 && c <= 90 ? c + 32 : c;
    if (lower !== needle.charCodeAt(k)) return -1;
  }
  return pos + needle.length;
}

function matchWord(text, pos, needle) {
  if (pos + needle.length > text.length) return -1;
  for (let k = 0; k < needle.length; k += 1) {
    if (text[pos + k] !== needle[k]) return -1;
  }
  return pos + needle.length;
}

function skipSpaces(text, pos) {
  while (pos < text.length && isSpaceChar(text[pos])) pos += 1;
  return pos;
}

function isAbsoluteHttp(url) {
  return url.startsWith(HTTP) || url.startsWith(HTTPS);
}

/** Read a quoted http(s)://... literal whose opening quote is at `pos`. */
function readQuotedUrl(text, pos) {
  const quote = text[pos];
  if (quote !== '"' && quote !== "'" && quote !== '`') return null;
  let i = pos + 1;
  if (text.startsWith(HTTP, i)) i += HTTP.length;
  else if (text.startsWith(HTTPS, i)) i += HTTPS.length;
  else return null;
  const start = pos + 1;
  let end = i;
  while (end < text.length && text[end] !== quote) end += 1;
  const url = text.slice(start, end);
  if (end >= text.length) return null;
  return { url, next: end + 1 };
}

/**
 * Scan a `url(...)` construct whose opening paren is at `pos`. Returns the
 * absolute http(s) URL found, or null. `pos` must point at '('.
 */
function scanUrlParen(text, pos) {
  let s = skipSpaces(text, pos + 1);
  if (s < text.length && isQuote(text[s])) {
    const q = readQuotedUrl(text, s);
    if (q && isAbsoluteHttp(q.url) && !q.url.startsWith('data:')) return q.url;
    return null;
  }
  let e = s;
  while (e < text.length && text[e] !== ')' && !isSpaceChar(text[e])) e += 1;
  const u = text.slice(s, e);
  if (isAbsoluteHttp(u)) return u;
  return null;
}

function originOf(url) {
  let clean = url;
  while (clean.length > 0 && ',.;:!?)]}'.indexOf(clean[clean.length - 1]) !== -1) {
    clean = clean.slice(0, clean.length - 1);
  }
  if (!isAbsoluteHttp(clean)) return null;
  try {
    return new URL(clean).origin;
  } catch {
    return null;
  }
}

function collectUrls(text, kind) {
  const fetch = [];
  const any = [];
  const n = text.length;

  // Informational pass: every absolute http(s) URL anywhere.
  let i = 0;
  while (i < n) {
    let start = -1;
    if (text.startsWith(HTTP, i)) start = i;
    else if (text.startsWith(HTTPS, i)) start = i;
    if (start < 0) {
      i += 1;
      continue;
    }
    let end = start;
    while (end < n && isUrlChar(text[end])) end += 1;
    any.push(text.slice(start, end));
    i = end;
  }

  // Fetch-position pass by file kind.
  if (kind === 'html') collectHtmlFetch(text, fetch);
  else if (kind === 'css') collectCssFetch(text, fetch);
  else if (kind === 'js') collectJsFetch(text, fetch);

  return { fetch, any };
}

const HTML_ATTRS = [
  'src',
  'href',
  'action',
  'poster',
  'data',
  'formaction',
  'srcset',
  'xlink:href'
];

function collectHtmlFetch(text, fetch) {
  const n = text.length;
  let j = 0;
  while (j < n) {
    const open = text.indexOf('<', j);
    if (open < 0) break;
    const close = text.indexOf('>', open + 1);
    if (close < 0) break;
    const tag = text.slice(open + 1, close);
    const tagLower = lowerAscii(tag);
    if (!tagLower.startsWith('!--') && !tagLower.startsWith('!doctype')) {
      for (const attr of HTML_ATTRS) {
        let k = 0;
        while (k < tag.length) {
          const at = tagLower.indexOf(attr, k);
          if (at < 0) break;
          const before = at > 0 ? tagLower[at - 1] : ' ';
          if ((before >= 'a' && before <= 'z') || before === '-' || before === ':') {
            k = at + attr.length;
            continue;
          }
          let p = skipSpaces(tag, at + attr.length);
          if (tag[p] !== '=') {
            k = at + attr.length;
            continue;
          }
          p = skipSpaces(tag, p + 1);
          if (p >= tag.length || !isQuote(tag[p])) {
            k = at + attr.length;
            continue;
          }
          const q = readQuotedUrl(tag, p);
          if (q && isAbsoluteHttp(q.url)) {
            if (attr === 'srcset') {
              const first = q.url.split(' ')[0];
              if (isAbsoluteHttp(first)) fetch.push(first);
            } else {
              fetch.push(q.url);
            }
          }
          k = at + attr.length;
        }
      }
    }
    j = close + 1;
  }
}

function collectCssFetch(text, fetch) {
  const n = text.length;
  let k = 0;
  while (k < n) {
    if (text[k] === '@') {
      const endImport = matchWordI(text, k + 1, 'import');
      if (endImport !== -1) {
        let p = skipSpaces(text, endImport);
        const endUrl = matchWord(text, p, 'url');
        if (endUrl !== -1) {
          p = skipSpaces(text, endUrl);
          if (text[p] === '(') {
            const u = scanUrlParen(text, p);
            if (u) fetch.push(u);
            k = p + 1;
            continue;
          }
        } else {
          const q = readQuotedUrl(text, p);
          if (q && isAbsoluteHttp(q.url)) fetch.push(q.url);
          k = p;
          continue;
        }
      }
    }
    if (text[k] === 'u' && matchWord(text, k, 'url') !== -1 && text[k + 3] === '(') {
      const u = scanUrlParen(text, k + 3);
      if (u) fetch.push(u);
      k = k + 4;
      continue;
    }
    k += 1;
  }
}

function collectJsFetch(text, fetch) {
  const n = text.length;
  let j = 0;
  OUTER: while (j < n) {
    let advanced = false;

    // 1) import(...) / fetch(...)
    for (const name of ['import', 'fetch']) {
      const end = matchWord(text, j, name);
      if (end !== -1 && (end >= n || !isIdentChar(text[end]))) {
        const p = skipSpaces(text, end);
        if (text[p] === '(') {
          const q = readQuotedUrl(text, p + 1);
          if (q && isAbsoluteHttp(q.url)) fetch.push(q.url);
        }
        advanced = true;
        j = end;
        break OUTER;
      }
    }

    // 2) new URL / new Worker / new SharedWorker / new EventSource (...)
    if (!advanced) {
      const endNew = matchWord(text, j, 'new');
      if (endNew !== -1 && (endNew >= n || !isIdentChar(text[endNew]))) {
        const p = skipSpaces(text, endNew);
        for (const ctor of ['URL', 'Worker', 'SharedWorker', 'EventSource']) {
          const ce = matchWord(text, p, ctor);
          if (ce !== -1 && (ce >= n || !isIdentChar(text[ce]))) {
            const p2 = skipSpaces(text, ce);
            if (text[p2] === '(') {
              const q = readQuotedUrl(text, p2 + 1);
              if (q && isAbsoluteHttp(q.url)) fetch.push(q.url);
            }
            advanced = true;
            j = ce;
            break OUTER;
          }
        }
      }
    }

    // 3) serviceWorker.register("...")
    if (!advanced) {
      const sw = matchWordI(text, j, 'serviceworker');
      if (sw !== -1) {
        const p = skipSpaces(text, sw);
        if (text[p] === '.') {
          const reg = matchWord(text, p + 1, 'register');
          if (reg !== -1 && (reg >= n || !isIdentChar(text[reg]))) {
            const p2 = skipSpaces(text, reg);
            if (text[p2] === '(') {
              const q = readQuotedUrl(text, p2 + 1);
              if (q && isAbsoluteHttp(q.url)) fetch.push(q.url);
            }
          }
        }
        advanced = true;
        j = p;
        break OUTER;
      }
    }

    // 4) .open("METHOD", "url")
    if (!advanced && text[j] === '.') {
      const op = matchWordI(text, j + 1, 'open');
      if (op !== -1 && (op >= n || !isIdentChar(text[op]))) {
        let p = skipSpaces(text, op);
        if (text[p] === '(') {
          const first = readQuotedUrl(text, p + 1);
          if (first) {
            let p2 = first.next;
            while (p2 < n && (isSpaceChar(text[p2]) || text[p2] === ',')) p2 += 1;
            const second = readQuotedUrl(text, p2);
            if (second && isAbsoluteHttp(second.url)) fetch.push(second.url);
          }
        }
        advanced = true;
        j = op;
        break OUTER;
      }
    }

    // 5) .src = "..." / .href = "..."
    if (!advanced && text[j] === '.') {
      for (const prop of ['src', 'href']) {
        const pr = matchWord(text, j + 1, prop);
        if (pr !== -1 && (pr >= n || !isIdentChar(text[pr]))) {
          let p = skipSpaces(text, pr);
          if (text[p] === '=') {
            const q = readQuotedUrl(text, skipSpaces(text, p + 1));
            if (q && isAbsoluteHttp(q.url)) fetch.push(q.url);
          }
          advanced = true;
          j = pr;
          break OUTER;
        }
      }
    }

    if (!advanced) j += 1;
  }
}

let failures = 0;
const findings = new Map(); // fetch-position origins -> Set of relative file paths
const informational = new Map(); // inert-only origins -> Set of relative file paths

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (st.isFile()) yield full;
  }
}

function kindOf(ext) {
  if (ext === '.css') return 'css';
  if (ext === '.html' || ext === '.htm' || ext === '.svg' || ext === '.webmanifest') return 'html';
  if (
    ext === '.js' ||
    ext === '.mjs' ||
    ext === '.json' ||
    ext === '.txt' ||
    ext === '.map' ||
    ext === '.headers'
  )
    return 'js';
  return null;
}

function record(map, origin, rel) {
  if (!map.has(origin)) map.set(origin, new Set());
  map.get(origin).add(rel);
}

function main() {
  const allowed = ALLOWED_ORIGINS[target];
  console.log(`[audit-runtime-urls] auditing "${buildDir}" for target "${target}"...`);

  let scanned = 0;
  for (const file of walk(buildDir)) {
    const ext = extname(file).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    scanned += 1;
    const content = readFileSync(file, 'utf8');
    const rel = file.slice(buildDir.length + 1);
    const { fetch, any } = collectUrls(content, kindOf(ext));

    for (const url of any) {
      const origin = originOf(url);
      if (!origin || INERT_ORIGINS.has(origin)) continue;
      record(informational, origin, rel);
    }
    for (const url of fetch) {
      const origin = originOf(url);
      if (!origin || INERT_ORIGINS.has(origin)) continue;
      record(findings, origin, rel);
    }
  }

  console.log(`[audit-runtime-urls] scanned ${scanned} text file(s).`);

  if (informational.size > 0) {
    console.log(
      '[audit-runtime-urls] informational: absolute URLs present only as inert strings (not fetched):'
    );
    for (const [origin, files] of informational) {
      if (findings.has(origin)) continue;
      console.log(
        `[audit-runtime-urls]   [inert] ${origin} (in ${[...files].slice(0, 5).join(', ')})`
      );
    }
  } else if (findings.size === 0) {
    console.log('[audit-runtime-urls] no absolute external URLs found at all.');
  }

  for (const [origin, files] of findings) {
    const sample = [...files].slice(0, 5).join(', ');
    if (allowed.has(origin)) {
      console.log(`[audit-runtime-urls]   [allowed] ${origin} (in ${sample})`);
    } else {
      failures += 1;
      process.stderr.write(
        `[audit-runtime-urls] ERROR: disallowed fetch-position origin ${origin} for target "${target}" ` +
          `(e.g. in ${sample}).\n`
      );
    }
  }

  if (failures > 0) {
    process.stderr.write(`\n[audit-runtime-urls] FAILED: ${failures} disallowed origin(s).\n`);
    process.exit(1);
  }

  console.log('\n[audit-runtime-urls] audit passed.');
}

main();
