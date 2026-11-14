import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { createRegistry, defineBlock } from '@parker2808/cms-core/contracts';
import {
  buildSnapshot,
  checkBlockLayout,
  checkBlockLimit,
  checkBlockRole,
  checkH1Insert,
  checkPageAllowance,
  findBlock,
  insertSortOrder,
  migrateSnapshot,
  nextBlockKey,
  orderBlocks,
  readSnapshot,
} from '@parker2808/cms-core/engine';
import { z } from 'zod';

const definition = defineBlock({
  type: 'header',
  version: 3,
  props: z.object({ title: z.string() }),
  defaults: { title: 'Title' },
  pages: ['home'],
  customPage: true,
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'h1',
  migrate: (props, version) => {
    if (typeof props?.title !== 'string') throw new Error('Missing title');
    return { ...props, title: `${props.title}-${version}` };
  },
});
const registry = createRegistry([definition]);
const block = {
  type: 'header',
  key: 'header',
  schemaVersion: 1,
  props: { title: 'Start' },
  layout: 'ONE',
  surface: 'PLAIN',
  isVisible: true,
  sortOrder: 0,
};
const seo = {
  seoTitleEn: 'Home',
  seoTitleVi: 'Trang chủ',
  seoDescriptionEn: null,
  seoDescriptionVi: null,
};

test('registry-injected policy preserves page, limit, layout and H1 findings', () => {
  assert.equal(findBlock(registry, 'missing'), undefined);
  assert.equal(findBlock(registry, '__proto__'), undefined);
  assert.equal(checkPageAllowance(definition, 'home', ['home']), undefined);
  assert.equal(checkPageAllowance(definition, 'ideas', ['home']), undefined);
  assert.deepEqual(checkPageAllowance(definition, 'about', ['home', 'about']), {
    code: 'BLOCK_NOT_ALLOWED',
    type: 'header',
    pageKey: 'about',
  });
  assert.deepEqual(checkBlockLimit(definition, 1), {
    code: 'BLOCK_LIMIT',
    type: 'header',
    limit: 1,
  });
  assert.equal(checkBlockLimit(definition, 0), undefined);
  assert.deepEqual(checkBlockLayout(definition, 'TWO'), {
    code: 'VALIDATION_FAILED',
    field: 'layout',
  });
  assert.deepEqual(checkBlockRole(definition, 'hide'), { code: 'BLOCK_LOCKED', action: 'hide' });
  assert.deepEqual(checkH1Insert(registry, 0, [block]), { code: 'BLOCK_LOCKED', action: 'insert' });
});

test('stable order, unique keys and inserts never mutate source', () => {
  const blocks = [
    { sortOrder: 2, key: 'a' },
    { sortOrder: 1, key: 'b' },
    { sortOrder: 1, key: 'c' },
  ];
  assert.deepEqual(
    orderBlocks(blocks).map(({ key }) => key),
    ['b', 'c', 'a'],
  );
  assert.equal(blocks[0].key, 'a');
  assert.equal(nextBlockKey('header', ['header', 'header-2']), 'header-3');
  assert.equal(insertSortOrder(undefined, blocks), 3);
  assert.equal(insertSortOrder(blocks[1], blocks), 2);
});

test('strict snapshots reject unknown/future/invalid blocks instead of dropping content', () => {
  const snapshot = buildSnapshot(seo, [block]);
  assert.deepEqual(snapshot, { seo, blocks: [block] });
  assert.notEqual(snapshot.blocks[0], block);
  assert.deepEqual(
    readSnapshot({ ...snapshot, blocks: [{ ...block, type: 'missing' }] }, registry),
    {
      ok: false,
      reason: 'UNKNOWN_TYPE',
      index: 0,
    },
  );
  assert.deepEqual(
    readSnapshot({ ...snapshot, blocks: [{ ...block, schemaVersion: 4 }] }, registry),
    {
      ok: false,
      reason: 'FUTURE_VERSION',
      index: 0,
    },
  );
  assert.equal(
    readSnapshot({ ...snapshot, blocks: [{ ...block, schemaVersion: 0 }] }, registry).ok,
    true,
  );
  assert.equal(
    readSnapshot({ ...snapshot, blocks: [{ ...block, schemaVersion: 3 }] }, registry).ok,
    true,
  );
  assert.deepEqual(readSnapshot({ ...snapshot, schemaVersion: 4 }, registry), {
    ok: false,
    reason: 'FUTURE_VERSION',
  });
  assert.deepEqual(readSnapshot({ ...snapshot, unexpected: true }, registry), {
    ok: false,
    reason: 'INVALID_SNAPSHOT',
  });
  assert.deepEqual(readSnapshot({ ...snapshot, seo: { ...seo, unexpected: true } }, registry), {
    ok: false,
    reason: 'INVALID_SNAPSHOT',
  });
  assert.deepEqual(
    readSnapshot({ ...snapshot, blocks: [{ ...block, unexpected: true }] }, registry),
    { ok: false, reason: 'INVALID_BLOCK', index: 0 },
  );
  assert.deepEqual(
    readSnapshot(
      { ...snapshot, blocks: [{ ...block, props: { title: 'Start', extra: 1 } }] },
      registry,
    ),
    {
      ok: true,
      snapshot: { ...snapshot, blocks: [{ ...block, props: { title: 'Start', extra: 1 } }] },
    },
  );
  assert.deepEqual(readSnapshot({ ...snapshot, blocks: [{ ...block, key: 'BAD' }] }, registry), {
    ok: false,
    reason: 'INVALID_SNAPSHOT',
  });
  assert.deepEqual(readSnapshot({ seo, blocks: [block, null] }, registry), {
    ok: false,
    reason: 'INVALID_SNAPSHOT',
  });
  const migrated = migrateSnapshot(snapshot, registry);
  assert.equal(migrated.ok, true);
  if (migrated.ok) {
    assert.equal(migrated.snapshot.blocks[0].schemaVersion, 3);
    assert.deepEqual(migrated.snapshot.blocks[0].props, { title: 'Start-1-2' });
  }
  assert.deepEqual(snapshot.blocks[0].props, { title: 'Start' });
  assert.deepEqual(migrateSnapshot({ ...snapshot, blocks: [{ ...block, props: {} }] }, registry), {
    ok: false,
    reason: 'INVALID_BLOCK',
    index: 0,
  });
});

test('Nest CommonJS consumer loads built engine and contracts without host definitions', () => {
  const require = createRequire(import.meta.url);
  const core = require('@parker2808/cms-core/engine');
  assert.equal(typeof core.migrateSnapshot, 'function');
  assert.equal(typeof require('@parker2808/cms-core/contracts').createRegistry, 'function');
  assert.equal(Object.keys(require('@parker2808/cms-core/contracts').createRegistry([])).length, 0);
});
