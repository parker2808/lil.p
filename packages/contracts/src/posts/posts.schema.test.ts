import { describe, expect, it } from 'vitest';

import { adminPostListItemSchema, adminPostListParamsSchema } from './posts.schema';

describe('adminPostListParamsSchema', () => {
  it('accepts status and tag filters on the default list query', () => {
    expect(adminPostListParamsSchema.parse({ status: 'DRAFT', tag: 'react' })).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: '-updatedAt',
      status: 'DRAFT',
      tag: 'react',
    });
  });
});

describe('adminPostListItemSchema', () => {
  it('requires tags, reading minutes and publishedAt', () => {
    const parsed = adminPostListItemSchema.parse({
      id: 1,
      slug: 'sample-note',
      titleEn: 'Sample note',
      titleVi: '',
      status: 'DRAFT',
      isFeatured: false,
      readingMinutes: 3,
      publishedAt: null,
      updatedAt: '2026-10-26T00:00:00.000Z',
      tags: [{ id: 2, slug: 'react', nameEn: 'React' }],
    });
    expect(parsed.tags[0]?.slug).toBe('react');
    expect(parsed.readingMinutes).toBe(3);
  });
});
