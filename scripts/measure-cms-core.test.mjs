import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { measure } from './measure-cms-core.mjs';

test('measures every built entry and rejects a breached combined cap', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'cms-budget-'));
  const sourceDir = join(fixture, 'src');
  const distDir = join(fixture, 'dist');
  mkdirSync(sourceDir);
  mkdirSync(distDir);
  try {
    const code = 'export const value = 1;';
    const bytes = gzipSync(code, { level: 9, mtime: 0 }).byteLength;
    for (const name of ['contracts', 'engine', 'react']) {
      writeFileSync(join(sourceDir, `${name}.ts`), 'export {};');
      writeFileSync(join(distDir, `${name}.js`), code);
    }
    assert.deepEqual(measure({ sourceDir, distDir }).totals, {
      browser: bytes * 2,
      react: bytes,
    });
    assert.throws(
      () => measure({ sourceDir, distDir, limits: { browser: bytes * 2 - 1, react: bytes } }),
      /browser exceeds/,
    );
    assert.throws(
      () => measure({ sourceDir, distDir, limits: { browser: bytes * 2, react: bytes - 1 } }),
      /react exceeds/,
    );
    writeFileSync(join(distDir, 'react.js'), 'import "@portfolio/ui";');
    assert.throws(() => measure({ sourceDir, distDir }), /Unexpected unbundled import/);
    writeFileSync(join(sourceDir, 'engine.ts'), 'import "@/modules/pages";');
    assert.throws(() => measure({ sourceDir, distDir }), /Host-specific import/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
