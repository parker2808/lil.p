import { describe, expect, it } from 'vitest';

import { moveIds } from './move-ids.util';

describe('moveIds', () => {
  it('swaps a row down for the order endpoint', () => {
    expect(moveIds([1, 2, 3], 1, 1)).toEqual([2, 1, 3]);
  });
});
