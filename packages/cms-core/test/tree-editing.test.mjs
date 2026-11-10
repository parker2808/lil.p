import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers';

import {
  applyTreeOperation,
  commitTreeHistory,
  createTreeHistory,
  DraftAutosave,
  readTree,
  redoTreeHistory,
  undoTreeHistory,
} from '@parker2808/cms-core/tree';

const page = () => ({
  schemaVersion: 1,
  root: {
    id: 'page',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'section',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'heading',
            type: 'component',
            componentType: 'heading',
            responsive: { base: { text: 'Hello', level: 1 } },
          },
        ],
      },
    ],
  },
});
const edit = (value, breakpoint = 'mobile') => ({
  kind: 'property',
  nodeId: 'heading',
  breakpoint,
  key: 'text',
  value,
});
const content = (document) => document.root.sections[0].content;

test('property overrides inherit, clear without touching base, and reject invalid edits losslessly', () => {
  const original = page();
  const changed = applyTreeOperation(original, edit('Xin chào'));
  assert.equal(changed.ok, true);
  assert.equal(content(changed.value)[0].responsive.mobile.text, 'Xin chào');
  assert.deepEqual(content(original)[0].responsive, { base: { text: 'Hello', level: 1 } });
  const cleared = applyTreeOperation(changed.value, {
    kind: 'clear-override',
    nodeId: 'heading',
    breakpoint: 'mobile',
    key: 'text',
  });
  assert.equal(cleared.ok, true);
  assert.deepEqual(cleared.value, original);
  const bad = applyTreeOperation(original, edit(42));
  assert.deepEqual({ ok: bad.ok, code: bad.code }, { ok: false, code: 'INVALID_PROPS' });
  assert.strictEqual(bad.input, original);
  assert.equal(applyTreeOperation(original, edit('invalid', 'television')).ok, false);
  assert.equal(applyTreeOperation(original, edit('invalid', '__proto__')).ok, false);
  assert.equal(
    applyTreeOperation(original, {
      kind: 'property',
      nodeId: 'heading',
      breakpoint: 'base',
      key: '__proto__',
      value: {},
    }).ok,
    false,
  );
});

test('atomic insert, move, duplicate and delete enforce slots, IDs, and bounds', () => {
  const original = page();
  const newNode = {
    id: 'divider',
    type: 'component',
    componentType: 'divider',
    responsive: { base: {} },
  };
  const inserted = applyTreeOperation(original, {
    kind: 'insert',
    parentId: 'section',
    slot: 'content',
    index: 1,
    node: newNode,
  });
  assert.equal(inserted.ok, true);
  const moved = applyTreeOperation(inserted.value, {
    kind: 'move',
    nodeId: 'divider',
    parentId: 'section',
    slot: 'content',
    index: 0,
  });
  assert.deepEqual(
    content(moved.value).map(({ id }) => id),
    ['divider', 'heading'],
  );
  const duplicated = applyTreeOperation(moved.value, {
    kind: 'duplicate',
    nodeId: 'divider',
    allocateId: () => 'divider-copy',
  });
  assert.equal(duplicated.ok, true);
  assert.deepEqual(
    content(duplicated.value).map(({ id }) => id),
    ['divider', 'divider-copy', 'heading'],
  );
  assert.equal(
    applyTreeOperation(original, {
      kind: 'insert',
      parentId: 'heading',
      slot: 'content',
      index: 0,
      node: newNode,
    }).ok,
    false,
  );
  assert.equal(
    applyTreeOperation(original, { kind: 'duplicate', nodeId: 'heading', allocateId: () => 'page' })
      .ok,
    false,
  );
  assert.equal(
    applyTreeOperation(original, {
      kind: 'duplicate',
      nodeId: 'heading',
      allocateId: () => {
        throw Error('allocator offline');
      },
    }).ok,
    false,
  );
  const cyclic = { ...newNode };
  cyclic.responsive = { base: { cyclic } };
  assert.equal(
    applyTreeOperation(original, {
      kind: 'insert',
      parentId: 'section',
      slot: 'content',
      index: 0,
      node: cyclic,
    }).ok,
    false,
  );
  assert.equal(
    applyTreeOperation(original, {
      kind: 'insert',
      parentId: 'section',
      slot: 'content',
      index: 0,
      node: { ...newNode, extra: undefined },
    }).ok,
    false,
  );
  assert.equal(applyTreeOperation(original, { kind: 'delete', nodeId: 'page' }).ok, false);
  assert.equal(readTree(original).ok, true);
});

test('grid mobile override accepts one column, invalid override leaves original intact', () => {
  const original = page();
  original.root.sections[0].content = [
    {
      id: 'grid',
      type: 'grid',
      responsive: { base: { columns: 2 } },
      items: original.root.sections[0].content,
    },
  ];
  const mobile = applyTreeOperation(original, {
    kind: 'property',
    nodeId: 'grid',
    breakpoint: 'mobile',
    key: 'columns',
    value: 1,
  });
  assert.equal(mobile.ok, true);
  assert.equal(mobile.value.root.sections[0].content[0].responsive.mobile.columns, 1);
  const invalid = applyTreeOperation(original, {
    kind: 'property',
    nodeId: 'grid',
    breakpoint: 'base',
    key: 'columns',
    value: 1,
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, 'INVALID_PROPS');
  assert.equal(original.root.sections[0].content[0].responsive.base.columns, 2);
});

test('history coalesces only consecutive typing; undo/redo restores exact snapshots and selection', () => {
  const original = page();
  let history = createTreeHistory(original, 'heading');
  for (const [value, at] of [
    ['H', 10],
    ['He', 400],
    ['Hello!', 1100],
  ]) {
    const result = commitTreeHistory(history, edit(value), {
      at,
      typing: true,
      selectedId: 'heading',
      limit: 2,
    });
    assert.equal(result.ok, true);
    history = result.value;
  }
  assert.equal(history.past.length, 2);
  history = undoTreeHistory(history);
  assert.equal(content(history.document)[0].responsive.mobile.text, 'He');
  history = redoTreeHistory(history);
  assert.equal(content(history.document)[0].responsive.mobile.text, 'Hello!');
  history = undoTreeHistory(history);
  history = commitTreeHistory(history, edit('VI', 'tablet'), {
    at: 1200,
    typing: true,
    selectedId: 'heading',
  }).value;
  assert.equal(history.future.length, 0);
  assert.deepEqual(content(original)[0].responsive, { base: { text: 'Hello', level: 1 } });
});

function harness(save, read = async () => ({ tree: page(), revision: '0' })) {
  const timers = new Map();
  let next = 0;
  const scheduler = {
    schedule(callback) {
      timers.set(++next, callback);
      return next;
    },
    cancel(handle) {
      timers.delete(handle);
    },
  };
  const controller = new DraftAutosave({ tree: page(), revision: '0' }, { save, read }, scheduler);
  return { controller, timers };
}

test('serialized CAS does not overwrite local edits entered during an in-flight save', async () => {
  let release;
  const calls = [];
  const { controller } = harness(async (draft) => {
    calls.push(draft);
    if (calls.length === 1)
      await new Promise((resolve) => {
        release = resolve;
      });
    return { tree: draft.tree, revision: String(calls.length) };
  });
  controller.edit(applyTreeOperation(page(), edit('one')).value);
  const first = controller.flush();
  controller.edit(applyTreeOperation(controller.state.local, edit('two')).value);
  assert.equal(controller.state.status, 'dirty');
  release();
  await first;
  assert.equal(controller.state.status, 'dirty');
  assert.equal(controller.state.acknowledged.revision, '1');
  await controller.flush();
  assert.equal(controller.state.status, 'saved');
  assert.equal(calls[1].expectedRevision, '1');
  assert.equal(content(controller.state.local)[0].responsive.mobile.text, 'two');
});

test('409 and timeout retain edits, review remote before retry, never auto-merge conflicts', async () => {
  let remote = { tree: page(), revision: '0' };
  const { controller } = harness(
    async () => {
      throw { status: 409 };
    },
    async () => remote,
  );
  controller.edit(applyTreeOperation(page(), edit('mine')).value);
  await controller.flush();
  assert.equal(controller.state.status, 'conflict');
  remote = { tree: applyTreeOperation(page(), edit('theirs')).value, revision: '1' };
  await controller.review();
  assert.equal(controller.resolveReviewed('acknowledge'), false);
  assert.equal(content(controller.state.local)[0].responsive.mobile.text, 'mine');
  assert.equal(controller.resolveReviewed('reload'), true);
  assert.deepEqual(controller.state.local, remote.tree);

  let saved;
  const timeout = harness(
    async (draft) => {
      saved = { tree: draft.tree, revision: '1' };
      throw new Error('timeout');
    },
    async () => saved,
  );
  timeout.controller.edit(applyTreeOperation(page(), edit('attempt')).value);
  await timeout.controller.flush();
  timeout.controller.edit(applyTreeOperation(timeout.controller.state.local, edit('later')).value);
  assert.equal(timeout.controller.state.status, 'review');
  await timeout.controller.review();
  assert.equal(timeout.controller.resolveReviewed('acknowledge'), true);
  assert.equal(timeout.controller.state.status, 'dirty');
  assert.equal(timeout.controller.state.acknowledged.revision, '1');
  assert.equal(content(timeout.controller.state.local)[0].responsive.mobile.text, 'later');
  timeout.controller.dispose();
  assert.equal(timeout.timers.size, 0);
});

test('offline review backs off and never sends another save without an explicit resolution', async () => {
  let reads = 0;
  let saves = 0;
  const timers = new Map();
  let next = 0;
  const scheduler = {
    schedule(callback, delay) {
      timers.set(++next, { callback, delay });
      return next;
    },
    cancel(handle) {
      timers.delete(handle);
    },
  };
  const controller = new DraftAutosave(
    { tree: page(), revision: '0' },
    {
      save: async () => {
        saves++;
        throw new Error('offline');
      },
      read: async () => {
        reads++;
        throw new Error('offline');
      },
    },
    scheduler,
  );
  controller.edit(applyTreeOperation(page(), edit('offline')).value);
  await controller.flush();
  await controller.review();
  assert.equal([...timers.values()][0].delay, 1000);
  const first = [...timers.entries()][0];
  timers.delete(first[0]);
  first[1].callback();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal([...timers.values()][0].delay, 2000);
  assert.equal(reads, 2);
  assert.equal(saves, 1);
  assert.equal(controller.state.status, 'review');
  controller.dispose();
  assert.equal(timers.size, 0);
});
