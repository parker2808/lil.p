import { expect, it } from 'vitest';

import { cloudinaryPreview } from './cloudinary-preview.util';
it('adds a tiny blurred image transformation only to Cloudinary images', () => {
  expect(cloudinaryPreview('https://res.cloudinary.com/demo/image/upload/v123/a.jpg')).toContain(
    '/upload/w_32,c_limit,e_blur:300,q_1/v123/a.jpg',
  );
  expect(
    cloudinaryPreview('https://res.cloudinary.com.example.org/demo/image/upload/a.jpg'),
  ).toBeUndefined();
  expect(cloudinaryPreview('/local.jpg')).toBeUndefined();
});
