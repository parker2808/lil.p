import { describe, expect, it } from 'vitest';

import { insertNode, moveNode, outline, removeNode, reorderNode, validDestinations } from './model';
import type { TreeDocument, TreeNode } from '@parker2808/cms-core/tree';

const empty: TreeDocument = {
  schemaVersion: 1,
  root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
};
const section = (id: string): Extract<TreeNode, { type: 'section' }> => ({
  id,
  type: 'section',
  responsive: { base: {} },
  content: [],
});
const heading = (id: string): Extract<TreeNode, { type: 'component' }> => ({
  id,
  type: 'component',
  componentType: 'heading',
  responsive: { base: { text: 'Hello', level: 1 } },
});

describe('canvas composition commands', () => {
  it('builds H1-less drafts without mutating the original', () => {
    const added = insertNode(empty, section('s1'), {
      parentId: 'page',
      slot: 'sections',
      index: 0,
    });
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(empty.root.sections).toHaveLength(0);
    expect(outline(added.document).map((item) => item.id)).toEqual(['page', 's1']);
    const headingAdded = insertNode(added.document, heading('h1'), {
      parentId: 's1',
      slot: 'content',
      index: 0,
    });
    expect(headingAdded.ok).toBe(true);
  });

  it('rejects illegal slots, duplicate IDs, and illegal IDs without dropping nodes', () => {
    const result = insertNode(empty, heading('h'), {
      parentId: 'page',
      slot: 'sections',
      index: 0,
    });
    expect(result).toMatchObject({ ok: false, document: empty, reason: 'INVALID_TARGET' });
    const added = insertNode(empty, section('s'), { parentId: 'page', slot: 'sections', index: 0 });
    if (!added.ok) throw new Error('Expected section insertion');
    expect(
      insertNode(added.document, section('s'), { parentId: 'page', slot: 'sections', index: 1 }),
    ).toMatchObject({ ok: false, reason: 'INVALID_ID', document: added.document });
    expect(
      insertNode(empty, section('bad id'), { parentId: 'page', slot: 'sections', index: 0 }).ok,
    ).toBe(false);
  });

  it('reorders and moves across sections while protecting cyclic moves', () => {
    const document: TreeDocument = {
      schemaVersion: 1,
      root: {
        ...empty.root,
        sections: [
          { ...section('first'), type: 'section', content: [heading('a'), heading('b')] },
          { ...section('second'), type: 'section', content: [] },
        ],
      },
    };
    const reordered = reorderNode(document, 'a', 1);
    if (!reordered.ok) throw new Error('Expected reorder');
    expect((reordered.document.root.sections[0]?.content[0] as TreeNode).id).toBe('b');
    const moved = moveNode(reordered.document, 'a', {
      parentId: 'second',
      slot: 'content',
      index: 0,
    });
    if (!moved.ok) throw new Error('Expected move');
    expect(moved.document.root.sections[1]?.content[0]?.id).toBe('a');
    expect(
      moveNode(moved.document, 'first', { parentId: 'first', slot: 'content', index: 0 }).ok,
    ).toBe(false);
    expect(validDestinations(document, 'a').some((item) => item.parentId === 'second')).toBe(true);
  });

  it('keeps the mandatory row columns together', () => {
    const row: TreeNode = {
      id: 'row',
      type: 'row',
      responsive: { base: {} },
      columns: [
        { id: 'left', type: 'column', responsive: { base: { span: 1 } }, content: [] },
        { id: 'right', type: 'column', responsive: { base: { span: 1 } }, content: [] },
      ],
    };
    const document: TreeDocument = {
      schemaVersion: 1,
      root: {
        ...empty.root,
        sections: [{ id: 's', type: 'section', responsive: { base: {} }, content: [row] }],
      },
    };
    expect(removeNode(document, 'left')).toMatchObject({
      ok: false,
      document,
      reason: 'INVALID_TREE',
    });
    expect(removeNode(document, 'row').ok).toBe(true);
  });

  it('uses grid.items for content and preserves one-column mobile overrides', () => {
    const grid: TreeNode = {
      id: 'grid',
      type: 'grid',
      responsive: {
        base: { columns: 2 },
        mobile: { columns: 1 },
      },
      items: [],
    };
    const document: TreeDocument = {
      schemaVersion: 1,
      root: { ...empty.root, sections: [{ ...section('s'), content: [grid] }] },
    };
    const result = insertNode(document, heading('h'), {
      parentId: 'grid',
      slot: 'items',
      index: 0,
    });
    if (!result.ok) throw new Error('Expected grid insertion');
    expect(result.document.root.sections[0]?.content[0]?.responsive.mobile).toEqual({ columns: 1 });
    expect(
      insertNode(document, heading('h'), { parentId: 'grid', slot: 'content', index: 0 }),
    ).toMatchObject({ ok: false, reason: 'INVALID_TARGET', document });
  });

  it('rejects oversized drafts and never mutates original references', () => {
    const document: TreeDocument = {
      schemaVersion: 1,
      root: { ...empty.root, sections: [section('s')] },
    };
    const huge = { ...heading('h'), responsive: { base: { text: 'a'.repeat(260_000), level: 1 } } };
    expect(insertNode(document, huge, { parentId: 's', slot: 'content', index: 0 })).toMatchObject({
      ok: false,
      reason: 'INVALID_TREE',
      document,
    });
    expect(document.root.sections[0]?.content).toHaveLength(0);
  });
});
