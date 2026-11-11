#!/usr/bin/env node
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages/cms-core/src');
const dist = join(root, 'packages/cms-core/dist');
const caps = { browser: 60 * 1024, react: 35 * 1024 };

export function measure({ sourceDir = source, distDir = dist, limits = caps } = {}) {
  const pending = [sourceDir];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(path);
      } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
        if (/@portfolio\/|@\/modules\//.test(readFileSync(path, 'utf8'))) {
          throw new Error(`Host-specific import in ${path}`);
        }
      }
    }
  }

  const sizes = {};
  for (const name of ['contracts', 'engine', 'react']) {
    const code = readFileSync(join(distDir, `${name}.js`));
    const imports = code.toString().matchAll(/(?:from\s*|import\s*\(|import\s*)["']([^"']+)["']/g);
    for (const [, specifier] of imports) {
      if (!/^(react(?:\/.*)?|react-dom(?:\/.*)?|zod(?:\/.*)?)$/.test(specifier)) {
        throw new Error(`Unexpected unbundled import in ${name}: ${specifier}`);
      }
    }
    sizes[name] = gzipSync(code, { level: 9, mtime: 0 }).byteLength;
  }

  const totals = { browser: sizes.contracts + sizes.engine, react: sizes.react };
  for (const [surface, bytes] of Object.entries(totals)) {
    if (bytes > limits[surface]) {
      throw new Error(`${surface} exceeds ${limits[surface]} bytes gzip: ${bytes} bytes`);
    }
  }
  return { sizes, totals, limits };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = measure();
    console.log(`cms-core browser: ${result.totals.browser}/${caps.browser} bytes gzip`);
    console.log(`cms-core react: ${result.totals.react}/${caps.react} bytes gzip`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
