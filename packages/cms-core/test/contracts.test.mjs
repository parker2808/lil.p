import assert from 'node:assert/strict';
import { test } from 'node:test';

import { z } from 'zod';

import {
  blockKeySchema,
  createRegistry,
  defineBlock,
  isBlockAllowedOnPage,
  layoutPresetSchema,
  localeSchema,
  pageSnapshotSchema,
  publicPageSchema,
} from '../dist/contracts.js';

const definition = defineBlock({
  type: 'sample',
  version: 1,
  props: z.object({ text: z.string() }),
  defaults: { text: '' },
  pages: ['home'],
  customPage: true,
  layouts: ['ONE'],
  role: 'optional',
});

test('defineBlock supplies identity migrations and empty references', () => {
  const props = { text: 'hello' };
  assert.strictEqual(definition.migrate(props, 0), props);
  assert.deepEqual(definition.refs(props), []);
});

test('createRegistry preserves definitions and rejects duplicate types', () => {
  const registry = createRegistry([definition]);
  assert.strictEqual(registry.sample, definition);
  assert.equal(registry.unknown, undefined);
  assert.throws(() => createRegistry([definition, definition]), /Duplicate block type: sample/);
  assert.throws(
    () => createRegistry([{ ...definition }, definition]),
    /Duplicate block type: sample/,
  );
});

test('allowance uses host supplied built-in keys, then customPage', () => {
  assert.equal(isBlockAllowedOnPage(definition, 'home', ['home', 'about']), true);
  assert.equal(isBlockAllowedOnPage(definition, 'about', ['home', 'about']), false);
  assert.equal(isBlockAllowedOnPage(definition, 'ideas', ['home', 'about']), true);
  assert.equal(
    isBlockAllowedOnPage({ ...definition, customPage: false }, 'ideas', ['home']),
    false,
  );
});

test('generic schemas validate locale, keys, layout and snapshots', () => {
  assert.deepEqual(localeSchema.options, ['en', 'vi']);
  assert.equal(localeSchema.safeParse('fr').success, false);
  assert.equal(blockKeySchema.safeParse('bad key').success, false);
  assert.equal(layoutPresetSchema.safeParse('ONE').success, true);
  assert.equal(layoutPresetSchema.safeParse('FIVE').success, false);
  assert.equal(pageSnapshotSchema.safeParse({ seo: {}, blocks: [] }).success, false);
  assert.equal(publicPageSchema.safeParse({ key: 'home', seo: {}, blocks: [] }).success, false);
});
