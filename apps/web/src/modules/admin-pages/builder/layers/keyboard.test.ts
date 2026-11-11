import { describe, expect, it } from 'vitest';
import type { TreeDocument } from '@parker2808/cms-core/tree';

import { navigateOutline, visibleOutline } from './keyboard';

const document: TreeDocument = {
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
            responsive: { base: { text: 'Hi', level: 1 } },
          },
        ],
      },
      { id: 'second', type: 'section', responsive: { base: {} }, content: [] },
    ],
  },
};

describe('Layers roving keyboard model', () => {
  it('navigates only expanded nodes, with Home/End and RTL horizontal directions', () => {
    const collapsed = new Set(['page']);
    expect(visibleOutline(document, collapsed).map((item) => item.id)).toEqual([
      'page',
      'section',
      'second',
    ]);
    expect(navigateOutline(document, collapsed, 'section', 'End').focusId).toBe('second');
    expect(navigateOutline(document, collapsed, 'section', 'Home').focusId).toBe('page');
    const opened = navigateOutline(document, collapsed, 'section', 'ArrowRight');
    expect(opened.expanded.has('section')).toBe(true);
    expect(navigateOutline(document, opened.expanded, 'section', 'ArrowRight').focusId).toBe(
      'heading',
    );
    expect(navigateOutline(document, opened.expanded, 'heading', 'ArrowRight', true).focusId).toBe(
      'section',
    );
    expect(
      navigateOutline(document, opened.expanded, 'section', 'ArrowLeft').expanded.has('section'),
    ).toBe(false);
  });
});
