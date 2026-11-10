import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { URL } from 'node:url';

test('built subpaths resolve independently and only contracts exports runtime values', async () => {
  const require = createRequire(import.meta.url);
  for (const subpath of ['contracts', 'engine', 'react']) {
    const specifier = `@parker2808/cms-core/${subpath}`;
    assert.match(require.resolve(specifier), new RegExp(`/dist/${subpath}\\.cjs$`));
    assert.match(import.meta.resolve(specifier), new RegExp(`/dist/${subpath}\\.js$`));
    const entry = await import(specifier);
    const required = require(specifier);
    if (subpath === 'contracts') {
      assert.equal(typeof entry.createRegistry, 'function');
      assert.equal(typeof entry.defineBlock, 'function');
      assert.equal(typeof required.createRegistry, 'function');
      assert.deepEqual(Object.keys(entry.createRegistry([])), []);
      assert.deepEqual(Object.keys(required.createRegistry([])), []);
    } else {
      assert.deepEqual(Object.keys(entry), []);
      assert.deepEqual(Object.keys(required), []);
    }
    assert.match(
      readFileSync(new URL(`../dist/${subpath}.d.ts`, import.meta.url), 'utf8'),
      /export/,
    );
  }
  assert.equal(
    Object.keys(require.cache).some((path) =>
      /\/(?:packages\/contracts|apps\/(?:api|web))\//.test(path),
    ),
    false,
    'importing cms-core must not load portfolio modules or block definitions',
  );
  assert.doesNotMatch(
    readFileSync(new URL('../dist/contracts.js', import.meta.url), 'utf8'),
    /@portfolio\/|@\/modules\//,
  );
  assert.match(readFileSync(new URL('../dist/react.js', import.meta.url), 'utf8'), /use client/);
});
