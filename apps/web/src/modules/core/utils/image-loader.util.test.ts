import { describe, expect, it } from 'vitest';

import imageLoader, { nearestVariantWidth } from './image-loader.util';

describe('imageLoader', () => {
  it('maps a width to the nearest Cloudinary variant', () => {
    expect(nearestVariantWidth(320)).toBe(480);
    expect(nearestVariantWidth(900)).toBe(960);
    expect(nearestVariantWidth(2000)).toBe(1600);
    expect(
      imageLoader({
        src: 'https://res.cloudinary.com/demo/image/upload/portfolio/abc',
        width: 700,
      }),
    ).toContain('/upload/w_960,c_limit,f_webp,q_auto/');
  });
});
