import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error(
    'Usage: node scripts/compare-cms-captures.mjs <before/manifest.json> <after/manifest.json>',
  );
  process.exit(1);
}

async function load(path) {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  const captures = new Map();
  for (const capture of manifest.captures) {
    const key = [capture.route, capture.locale, capture.theme, capture.width].join('|');
    if (captures.has(key)) throw new Error(`Duplicate capture: ${key}`);
    const bytes = await readFile(resolve(dirname(path), capture.file));
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== capture.sha256) throw new Error(`Invalid screenshot hash: ${key}`);
    captures.set(key, capture);
  }
  if (manifest.failures.length) throw new Error(`Capture failures in ${path}`);
  return captures;
}

const before = await load(beforePath);
const after = await load(afterPath);
const missing = [...before.keys()].filter((key) => !after.has(key));
const added = [...after.keys()].filter((key) => !before.has(key));
const changed = [...before].filter(([key, capture]) => after.get(key)?.sha256 !== capture.sha256);
console.log(
  JSON.stringify(
    {
      before: before.size,
      after: after.size,
      missing,
      added,
      changed: changed.map(([key]) => key),
    },
    null,
    2,
  ),
);
if (missing.length || added.length) process.exitCode = 1;
