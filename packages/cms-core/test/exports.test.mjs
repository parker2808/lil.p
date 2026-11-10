import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { URL } from 'node:url';

test('built subpaths resolve independently without runtime exports', async () => {
  for (const subpath of ['contracts', 'engine', 'react']) {
    const entry = await import(`@parker2808/cms-core/${subpath}`);
    assert.deepEqual(Object.keys(entry), []);
    assert.match(
      readFileSync(new URL(`../dist/${subpath}.d.ts`, import.meta.url), 'utf8'),
      /export/,
    );
  }
  assert.match(readFileSync(new URL('../dist/react.js', import.meta.url), 'utf8'), /use client/);
});
