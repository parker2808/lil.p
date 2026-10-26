import { describe, expect, it } from 'vitest';

import { applySortableReorder } from './sortable-reorder.util';

describe('applySortableReorder', () => {
  it('moves work above featured while the H1 stays first', () => {
    const next = applySortableReorder(
      ['hero', 'featured', 'work'],
      'work',
      'featured',
      new Set(['hero']),
    );
    expect(next).toEqual(['hero', 'work', 'featured']);
  });

  it('rejects dropping above a locked H1', () => {
    expect(
      applySortableReorder(['hero', 'featured', 'work'], 'work', 'hero', new Set(['hero'])),
    ).toBeNull();
  });

  it('rejects dragging a locked item', () => {
    expect(
      applySortableReorder(['hero', 'featured'], 'hero', 'featured', new Set(['hero'])),
    ).toBeNull();
  });
});
