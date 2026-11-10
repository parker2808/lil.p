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
  const manifest = join(fixture, 'package.json');
  mkdirSync(sourceDir);
  mkdirSync(distDir);
  try {
    writeFileSync(
      manifest,
      JSON.stringify({
        peerDependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          zod: '^4.0.0',
        },
      }),
    );
    const code = 'export const value = 1;';
    const bytes = gzipSync(code, { level: 9, mtime: 0 }).byteLength;
    for (const name of ['contracts', 'engine', 'react']) {
      writeFileSync(join(sourceDir, `${name}.ts`), 'export {};');
      writeFileSync(join(distDir, `${name}.js`), code);
    }
    assert.deepEqual(measure({ sourceDir, distDir, manifest }).totals, {
      browser: bytes * 2,
      react: bytes,
    });
    assert.throws(
      () =>
        measure({ sourceDir, distDir, manifest, limits: { browser: bytes * 2 - 1, react: bytes } }),
      /browser exceeds/,
    );
    assert.throws(
      () =>
        measure({ sourceDir, distDir, manifest, limits: { browser: bytes * 2, react: bytes - 1 } }),
      /react exceeds/,
    );
    writeFileSync(join(distDir, 'react.js'), 'import "@portfolio/ui";');
    assert.throws(() => measure({ sourceDir, distDir, manifest }), /Unexpected unbundled import/);
    writeFileSync(join(distDir, 'react.js'), 'import "react-dom/client";');
    assert.equal(measure({ sourceDir, distDir, manifest }).totals.browser, bytes * 2);
    writeFileSync(
      manifest,
      JSON.stringify({ peerDependencies: { react: '^19.0.0', zod: '^4.0.0' } }),
    );
    assert.throws(
      () => measure({ sourceDir, distDir, manifest }),
      /Missing react-dom 19 peer dependency/,
    );
    writeFileSync(join(sourceDir, 'engine.ts'), 'import "@/modules/pages";');
    writeFileSync(
      manifest,
      JSON.stringify({
        peerDependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          zod: '^4.0.0',
        },
      }),
    );
    assert.throws(() => measure({ sourceDir, distDir, manifest }), /Host-specific import/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
