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
