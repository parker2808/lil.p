import type { PublicPostListItem } from '../posts/posts.type';

export const postFixture: PublicPostListItem = {
  id: 1,
  slug: 'sample-note',
  title: 'What transfers between stacks',
  excerpt: 'A short note about moving UI without rewriting the contracts.',
  readingMinutes: 6,
  isFeatured: true,
  publishedAt: '2026-10-12T00:00:00.000Z',
  tags: [
    { id: 1, slug: 'react', name: 'React', lang: 'en' },
    { id: 2, slug: 'vue', name: 'Vue', lang: 'en' },
  ],
  lang: 'en',
};

export const viPostFixture: PublicPostListItem = {
  ...postFixture,
  id: 2,
  slug: 'sample-note-vi',
  title: 'Ghi chú mẫu',
  excerpt: 'Đoạn trích hai dòng để kiểm tra dấu tiếng Việt không bị cắt.',
  lang: 'vi',
  isFeatured: false,
};

export const postFixtures = [postFixture, viPostFixture];
