import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { URL } from 'node:url';

test('built subpaths resolve independently and only contracts exports runtime values', async () => {
  const require = createRequire(import.meta.url);
  for (const subpath of ['contracts', 'engine', 'react']) {
    const entry = await import(`@parker2808/cms-core/${subpath}`);
    if (subpath === 'contracts') {
      assert.equal(typeof entry.createRegistry, 'function');
      assert.equal(typeof entry.defineBlock, 'function');
      assert.equal(typeof require('@parker2808/cms-core/contracts').createRegistry, 'function');
    } else {
      assert.deepEqual(Object.keys(entry), []);
    }
    assert.match(
      readFileSync(new URL(`../dist/${subpath}.d.ts`, import.meta.url), 'utf8'),
      /export/,
    );
  }
  assert.match(readFileSync(new URL('../dist/react.js', import.meta.url), 'utf8'), /use client/);
});
