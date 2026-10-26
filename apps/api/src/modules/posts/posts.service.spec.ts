import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PostsService } from './posts.service';

const published = {
  id: 1,
  slug: 'vue-to-react',
  titleEn: 'Vue to React',
  titleVi: '',
  excerptEn: 'What transfers.',
  excerptVi: '',
  bodyEn: 'English body',
  bodyVi: '',
  takeawaysEn: 'Keep the contracts',
  takeawaysVi: '',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  readingMinutes: 6,
  isFeatured: true,
  publishedAt: new Date('2026-10-12'),
  sortOrder: 0,
  tags: [{ id: 1, slug: 'react', nameEn: 'React', nameVi: 'React' }],
};

describe('PostsService', () => {
  it('returns 404 for a draft or unknown slug', async () => {
    const service = new PostsService({
      post: { findFirst: vi.fn().mockResolvedValue(null) },
    } as never);
    await expect(service.getPublic('draft-note', 'en')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('falls back to English when Vietnamese body is missing', async () => {
    const service = new PostsService({
      post: { findFirst: vi.fn().mockResolvedValue(published) },
    } as never);
    const detail = await service.getPublic('vue-to-react', 'vi');
    expect(detail.lang).toBe('en');
    expect(detail.body).toBe('English body');
  });
});
