import type { PublicProfile } from '@portfolio/contracts';

// ASSET(Parker): replace mock avatar with real portrait
export const MOCK_AVATAR_SRC = '/mock/avatar.svg';

export type AboutAvatar = { src: string; srcSet?: string; alt: string };

/** The profile photo when one is set, otherwise the neutral mock avatar. */
export function aboutAvatar(profile: Pick<PublicProfile, 'avatar' | 'displayName'>): AboutAvatar {
  const photo = profile.avatar;
  if (photo?.url) {
    return {
      src: photo.url,
      srcSet: photo.srcset || undefined,
      alt: photo.alt || profile.displayName,
    };
  }
  return { src: MOCK_AVATAR_SRC, alt: profile.displayName };
}
