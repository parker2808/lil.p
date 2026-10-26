import type { Locale, PublicPostDetail, PublicPostListItem } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { PostRow } from './post.entity';

const LIST_TEXT = ['title', 'excerpt'] as const;
const DETAIL_TEXT = [
  'title',
  'excerpt',
  'body',
  'takeaways',
  'seoTitle',
  'seoDescription',
] as const;

function takeaways(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function toTags(row: PostRow, locale: Locale) {
  return row.tags.map((tag) => {
    const { values, lang } = pickGroup(tag, ['name'] as const, locale);
    return { id: tag.id, slug: tag.slug, name: values.name ?? '', lang };
  });
}

export function toPublicPostListItem(row: PostRow, locale: Locale): PublicPostListItem {
  const { values, lang } = pickGroup(row, LIST_TEXT, locale);
  return {
    id: row.id,
    slug: row.slug,
    title: values.title ?? '',
    excerpt: values.excerpt ?? '',
    readingMinutes: row.readingMinutes,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    tags: toTags(row, locale),
    lang,
  };
}

export function toPublicPostDetail(row: PostRow, locale: Locale): PublicPostDetail {
  const { values, lang } = pickGroup(row, DETAIL_TEXT, locale);
  return {
    ...toPublicPostListItem(row, locale),
    lang,
    title: values.title ?? '',
    excerpt: values.excerpt ?? '',
    body: values.body ?? '',
    takeaways: takeaways(values.takeaways ?? ''),
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  };
}
