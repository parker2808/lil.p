import { describe, expect, it } from 'vitest';

import { MOCK_AVATAR_SRC, aboutAvatar } from './about-avatar.util';

describe('aboutAvatar', () => {
  it('uses the mock avatar with the profile name when no photo is set', () => {
    expect(aboutAvatar({ displayName: 'Parker Vu', avatar: null })).toEqual({
      src: MOCK_AVATAR_SRC,
      alt: 'Parker Vu',
    });
    expect(MOCK_AVATAR_SRC).toBe('/mock/avatar.svg');
  });

  it('prefers the profile photo and falls back to the name for empty alt text', () => {
    expect(
      aboutAvatar({
        displayName: 'Parker Vu',
        avatar: { url: 'https://cdn.test/me.jpg', srcset: '', width: 1, height: 1, alt: '' },
      }),
    ).toEqual({ src: 'https://cdn.test/me.jpg', srcSet: undefined, alt: 'Parker Vu' });
  });
});
