import { describe, expect, it } from 'vitest';
import type { TreeDocument, TreeNode } from '@parker2808/cms-core/tree';

import { reduceBuilderCommand, type BuilderState } from './commands';

const empty: TreeDocument = {
  schemaVersion: 1,
  root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
};

describe('controlled builder commands', () => {
  it('accepts a complete operation and returns the new selection without mutating input', () => {
    const state: BuilderState = { document: empty, selectedId: 'page' };
    const node: TreeNode = {
      id: 'section',
      type: 'section',
      responsive: { base: {} },
      content: [],
    };
    const result = reduceBuilderCommand(state, {
      type: 'insert',
      node,
      destination: { parentId: 'page', slot: 'sections', index: 0 },
    });
    expect(result).toMatchObject({ ok: true, selectedId: 'section' });
    expect(state.document.root.sections).toHaveLength(0);
    if (!result.ok) throw new Error('Expected a valid insert');
    expect(
      reduceBuilderCommand(
        { document: result.document, selectedId: result.selectedId },
        { type: 'remove', id: 'section' },
      ),
    ).toMatchObject({ ok: true, selectedId: 'page', document: empty });
  });

  it('rejects an illegal column delete and retains the document and selection', () => {
    const document: TreeDocument = {
      schemaVersion: 1,
      root: {
        ...empty.root,
        sections: [
          {
            id: 'section',
            type: 'section',
            responsive: { base: {} },
            content: [
              {
                id: 'row',
                type: 'row',
                responsive: { base: {} },
                columns: [
                  { id: 'left', type: 'column', responsive: { base: { span: 1 } }, content: [] },
                  { id: 'right', type: 'column', responsive: { base: { span: 1 } }, content: [] },
                ],
              },
            ],
          },
        ],
      },
    };
    const state = { document, selectedId: 'left' };
    expect(reduceBuilderCommand(state, { type: 'remove', id: 'left' })).toEqual({
      ok: false,
      document,
      reason: 'REQUIRED_COLUMN',
    });
    expect(state.selectedId).toBe('left');
  });

  it('validates selection and replacement before accepting a D5 property transaction', () => {
    const state: BuilderState = { document: empty, selectedId: 'page' };
    expect(reduceBuilderCommand(state, { type: 'select', id: 'missing' })).toMatchObject({
      ok: false,
      document: empty,
      reason: 'NOT_FOUND',
    });
    expect(
      reduceBuilderCommand(state, { type: 'replace', document: empty, selectedId: 'missing' }),
    ).toMatchObject({ ok: false, document: empty, reason: 'INVALID_TREE' });
  });
});
