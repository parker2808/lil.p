import { describe, expect, it } from 'vitest';

import { previewVersion } from './preview-version.util';

describe('previewVersion', () => {
  it('accepts positive safe integer versions, including the first query value', () => {
    expect(previewVersion({ v: '1' })).toBe(1);
    expect(previewVersion({ v: ['2', '3'] })).toBe(2);
  });

  it.each(['', '0', '-1', '1.5', 'NaN', '9007199254740992'])(
    'ignores invalid version %s',
    (value) => {
      expect(previewVersion({ v: value })).toBeUndefined();
    },
  );
});
