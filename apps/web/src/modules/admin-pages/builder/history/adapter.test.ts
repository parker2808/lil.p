import { createTreeHistory, redoTreeHistory, undoTreeHistory } from '@parker2808/cms-core/tree';
import { describe, expect, it } from 'vitest';

import { commitComposition, commitProperty } from './adapter';

const empty = {
  schemaVersion: 1 as const,
  root: { id: 'page', type: 'page' as const, responsive: { base: {} }, sections: [] },
};

describe('D4 and D5 history adapter', () => {
  it('commits a whole insertion and restores the exact selection on undo and redo', () => {
    const initial = createTreeHistory(empty, 'page');
    const inserted = commitComposition(initial, {
      type: 'insert',
      node: { id: 'section', type: 'section', responsive: { base: {} }, content: [] },
      destination: { parentId: 'page', slot: 'sections', index: 0 },
    });
    expect(inserted.result.ok).toBe(true);
    expect(inserted.history.past).toHaveLength(1);
    expect(undoTreeHistory(inserted.history)).toMatchObject({
      document: empty,
      selectedId: 'page',
    });
    expect(redoTreeHistory(undoTreeHistory(inserted.history)).selectedId).toBe('section');
    expect(initial.document.root.sections).toHaveLength(0);
  });

  it('maps reorder, same-parent move, delete and selection into single validated commits', () => {
    let history = createTreeHistory(empty, 'page');
    for (const id of ['first', 'second', 'third']) {
      const inserted = commitComposition(history, {
        type: 'insert',
        node: { id, type: 'section', responsive: { base: {} }, content: [] },
        destination: {
          parentId: 'page',
          slot: 'sections',
          index: history.document.root.sections.length,
        },
      });
      expect(inserted.result.ok).toBe(true);
      history = inserted.history;
    }
    const reordered = commitComposition(history, { type: 'reorder', id: 'first', direction: 1 });
    expect(reordered.result.ok).toBe(true);
    expect(reordered.history.document.root.sections.map((section) => section.id)).toEqual([
      'second',
      'first',
      'third',
    ]);
    expect(reordered.history.past).toHaveLength(4);
    const moved = commitComposition(reordered.history, {
      type: 'move',
      id: 'second',
      destination: { parentId: 'page', slot: 'sections', index: 3 },
    });
    expect(moved.history.document.root.sections.map((section) => section.id)).toEqual([
      'first',
      'third',
      'second',
    ]);
    expect(moved.history.past).toHaveLength(5);
    const selected = commitComposition(moved.history, { type: 'select', id: 'third' });
    expect(selected.history.past).toHaveLength(5);
    const removed = commitComposition(selected.history, { type: 'remove', id: 'third' });
    expect(removed.result).toMatchObject({ ok: true, selectedId: 'page' });
    expect(removed.history.past).toHaveLength(6);
    expect(
      undoTreeHistory(removed.history).document.root.sections.map((section) => section.id),
    ).toEqual(['first', 'third', 'second']);
    const rejected = commitComposition(removed.history, { type: 'remove', id: 'missing' });
    expect(rejected.result).toMatchObject({ ok: false, reason: 'NOT_FOUND' });
    expect(rejected.history).toBe(removed.history);
  });

  it('records a validated whole-document replacement once without translating it to a tree operation', () => {
    const history = createTreeHistory(empty, 'page');
    const replacement = {
      ...empty,
      root: {
        ...empty.root,
        sections: [
          { id: 'section', type: 'section' as const, responsive: { base: {} }, content: [] },
        ],
      },
    };
    const changed = commitComposition(history, {
      type: 'replace',
      document: replacement,
      selectedId: 'section',
    });
    expect(changed.result.ok).toBe(true);
    expect(changed.history.past).toHaveLength(1);
    expect(undoTreeHistory(changed.history).document).toEqual(empty);
  });

  it('records one validated responsive property edit without changing its source on rejection', () => {
    const inserted = commitComposition(createTreeHistory(empty, 'page'), {
      type: 'insert',
      node: { id: 'section', type: 'section', responsive: { base: {} }, content: [] },
      destination: { parentId: 'page', slot: 'sections', index: 0 },
    }).history;
    const changed = commitProperty(inserted, {
      kind: 'property',
      nodeId: 'section',
      breakpoint: 'mobile',
      key: '__proto__',
      value: 'bad',
    });
    expect(changed.error).toBe('INVALID_SLOT');
    expect(changed.history).toBe(inserted);
  });
});
