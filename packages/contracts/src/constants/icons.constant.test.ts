import { describe, expect, it } from 'vitest';

import { ICON_KEYS, iconKeySchema } from './icons.constant';

describe('iconKeySchema', () => {
  it('accepts an allowlisted key', () => {
    expect(iconKeySchema.parse('sparkles')).toBe('sparkles');
  });

  it('rejects an unknown key', () => {
    expect(iconKeySchema.safeParse('emoji-face').success).toBe(false);
  });

  it('has at least 40 keys', () => {
    expect(ICON_KEYS.length).toBeGreaterThanOrEqual(40);
  });
});
