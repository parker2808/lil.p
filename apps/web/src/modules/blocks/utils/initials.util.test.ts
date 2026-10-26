import { describe, expect, it } from 'vitest';

import { initials } from './initials.util';

describe('initials', () => {
  it('uses the first letters of the first two words', () => {
    expect(initials('Parker Vu')).toBe('PV');
  });
});
