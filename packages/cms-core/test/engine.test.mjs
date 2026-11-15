import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { URL } from 'node:url';

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

test('raw legacy bytes survive read and migration while unsupported envelopes reject without edits', () => {
  const raw = {
    seo,
    blocks: [{ ...block, props: { title: 'Start', nested: { future: [1, { keep: true }] } } }],
  };
  const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const before = hash(raw);
  const read = readSnapshot(raw, registry);
  assert.equal(read.ok, true);
  if (read.ok) {
    assert.equal(hash(read.snapshot), before);
    assert.notStrictEqual(read.snapshot.blocks[0].props, raw.blocks[0].props);
    read.snapshot.blocks[0].props.nested.future[1].keep = false;
    assert.equal(hash(raw), before);
  }
  const migrated = migrateSnapshot(raw, registry);
  assert.equal(migrated.ok, true);
  if (migrated.ok) {
    assert.deepEqual(migrated.snapshot.blocks[0].props.nested, raw.blocks[0].props.nested);
    assert.equal(migrated.snapshot.blocks[0].schemaVersion, definition.version);
  }
  for (const [invalid, reason] of [
    [{ ...raw, schemaVersion: 2 }, 'FUTURE_VERSION'],
    [{ ...raw, unknown: { future: true } }, 'INVALID_SNAPSHOT'],
    [{ ...raw, blocks: [{ ...raw.blocks[0], schemaVersion: 4 }] }, 'FUTURE_VERSION'],
    [{ ...raw, blocks: [{ ...raw.blocks[0], extra: true }] }, 'INVALID_BLOCK'],
    [{ ...raw, blocks: [{ ...raw.blocks[0], type: 'unknown' }] }, 'UNKNOWN_TYPE'],
  ]) {
    const unchanged = hash(invalid);
    assert.deepEqual(readSnapshot(invalid, registry).reason, reason);
    assert.equal(hash(invalid), unchanged);
    assert.equal(hash(raw), before);
  }
});

test('V21 raw fixture inventory preserves nested data or rejects every unsupported shape without edits', () => {
  const current = JSON.parse(
    readFileSync(new URL('./fixtures/raw-snapshot-inventory.json', import.meta.url), 'utf8'),
  );
  const rawHash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const originalHash = rawHash(current);
  const read = readSnapshot(current, registry);
  assert.equal(read.ok, true);
  assert.equal(rawHash(read.snapshot), originalHash);
  assert.notStrictEqual(read.snapshot.blocks[0].props, current.blocks[0].props);
  const migrated = migrateSnapshot(current, registry);
  assert.equal(migrated.ok, true);
  assert.deepEqual(
    migrated.snapshot.blocks[0].props.unrecognized,
    current.blocks[0].props.unrecognized,
  );
  assert.equal(migrated.snapshot.blocks[0].schemaVersion, definition.version);
  assert.equal(rawHash(current), originalHash);

  const cases = [
    [{ ...current, seo: { ...current.seo, extra: 'raw' } }, 'INVALID_SNAPSHOT'],
    [{ ...current, extra: { nested: true } }, 'INVALID_SNAPSHOT'],
    [{ ...current, schemaVersion: 2 }, 'FUTURE_VERSION'],
    [{ ...current, blocks: [{ ...current.blocks[0], type: 'future-block' }] }, 'UNKNOWN_TYPE'],
    [{ ...current, blocks: [{ ...current.blocks[0], schemaVersion: 4 }] }, 'FUTURE_VERSION'],
    [{ ...current, blocks: [{ ...current.blocks[0], extra: { nested: true } }] }, 'INVALID_BLOCK'],
    [{ ...current, blocks: [null] }, 'INVALID_SNAPSHOT'],
    [{ ...current, seo: { seoTitleEn: 'missing fields' } }, 'INVALID_SNAPSHOT'],
  ];
  for (const [raw, reason] of cases) {
    const before = rawHash(raw);
    for (const operation of [readSnapshot, migrateSnapshot]) {
      const result = operation(raw, registry);
      assert.equal(result.ok, false);
      assert.equal(result.reason, reason);
      assert.equal(rawHash(raw), before);
    }
    assert.equal(rawHash(current), originalHash);
  }
});

test('Nest CommonJS consumer loads built engine and contracts without host definitions', () => {
  const require = createRequire(import.meta.url);
  const core = require('@parker2808/cms-core/engine');
  assert.equal(typeof core.migrateSnapshot, 'function');
  assert.equal(typeof require('@parker2808/cms-core/contracts').createRegistry, 'function');
  assert.equal(Object.keys(require('@parker2808/cms-core/contracts').createRegistry([])).length, 0);
});
