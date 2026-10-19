/**
 * [NEW] Build-time asset manifest verification (Docker plan §3).
 *
 * Verifies that every required entry in `assets/manifest.json` exists in the
 * build output before the Docker image is assembled. Fails the build with a
 * clear error when a required asset is missing, so the offline guarantee is
 * never silently violated.
 *
 * Usage:
 *   node scripts/verify-manifest.mjs [buildDir]
 *
 * Defaults to `build/` when no directory is given.
 */

import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const buildDir = process.argv[2] ?? 'build';
const manifestPath = join(process.cwd(), 'assets', 'manifest.json');

let failures = 0;

function fail(message) {
  process.stderr.write(`[verify-manifest] ERROR: ${message}\n`);
  failures += 1;
}

function readManifest() {
  if (!existsSync(manifestPath)) {
    fail(`manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function entryExists(baseDir, relPath) {
  return existsSync(join(baseDir, relPath));
}

function isDirectory(baseDir, relPath) {
  try {
    return statSync(join(baseDir, relPath)).isDirectory();
  } catch {
    return false;
  }
}

function checkEntry(entry, baseDir) {
  const { path: relPath, required = false, type } = entry;

  if (!relPath) {
    fail('manifest entry missing "path"');
    return;
  }

  const present = entryExists(baseDir, relPath);

  if (type === 'directory') {
    if (!present) {
      if (required) fail(`required directory missing: ${relPath}`);
      else console.log(`[verify-manifest]   [optional dir] ${relPath} — not present (skipped)`);
    } else if (!isDirectory(baseDir, relPath)) {
      fail(`manifest entry is expected to be a directory but is a file: ${relPath}`);
    } else {
      console.log(
        `[verify-manifest]   [${required ? 'required' : 'optional'} dir] ${relPath} — OK`
      );
    }
    return;
  }

  if (!present) {
    if (required) fail(`required file missing: ${relPath}`);
    else console.log(`[verify-manifest]   [optional file] ${relPath} — not present (skipped)`);
    return;
  }

  console.log(`[verify-manifest]   [${required ? 'required' : 'optional'} file] ${relPath} — OK`);
}

function main() {
  const manifest = readManifest();

  console.log(`[verify-manifest] checking manifest against "${buildDir}"...`);

  // Build output entries are checked inside the build directory.
  const buildOutput = manifest.buildOutput ?? [];
  if (Array.isArray(buildOutput)) {
    console.log(`[verify-manifest]   ${buildOutput.length} build output entries:`);
    for (const entry of buildOutput) {
      checkEntry(entry, buildDir);
    }
  }

  // [Stage 9A, FR-43 / D-09] Every registered tool must have a prerendered
  // HTML route in the build output. The id list lives in the manifest and is
  // kept in sync with the registry by tests/unit/manifest.test.ts.
  const toolIds = manifest.toolIds ?? [];
  if (Array.isArray(toolIds)) {
    console.log(`[verify-manifest]   ${toolIds.length} prerendered tool route(s):`);
    for (const id of toolIds) {
      checkEntry({ path: `tools/${id}.html`, type: 'html', required: true }, buildDir);
    }
  }

  // Project files are checked at the repository root.
  const projectFiles = manifest.projectFiles ?? [];
  if (Array.isArray(projectFiles)) {
    console.log(`[verify-manifest]   ${projectFiles.length} project file entries:`);
    for (const entry of projectFiles) {
      checkEntry(entry, process.cwd());
    }
  }

  if (failures > 0) {
    process.stderr.write(`\n[verify-manifest] FAILED: ${failures} manifest check(s) failed.\n`);
    process.exit(1);
  }

  console.log(`\n[verify-manifest] all manifest checks passed.`);
}

main();
