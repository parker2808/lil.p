import 'server-only';

import {
  type Locale,
  type PostListParams,
  type PublicPostDetail,
  type PublicPostListItem,
  type PublicPostListPage,
  publicPostDetailSchema,
  publicPostListPageSchema,
} from '@portfolio/contracts';

import { draftMode } from 'next/headers';

import { apiServer } from '@/modules/core/services/api-server.service';
import { ApiError } from '@/modules/core/utils/api-error.util';

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export async function listPostsPage(
  locale: Locale,
  params: Partial<PostListParams> = {},
): Promise<PublicPostListPage> {
  return apiServer(`/api/public/posts${queryString(params)}`, {
    locale,
    tags: ['posts'],
    schema: publicPostListPageSchema,
  });
}

export async function listPosts(
  locale: Locale,
  params: Partial<PostListParams> = {},
): Promise<PublicPostListItem[]> {
  const page = await listPostsPage(locale, params);
  return page.items;
}

export async function getPost(slug: string, locale: Locale): Promise<PublicPostDetail> {
  const draft = await draftMode();
  if (draft.isEnabled) {
    return apiServer(`/api/admin/preview/posts/${encodeURIComponent(slug)}`, {
      locale,
      withAuth: true,
      schema: publicPostDetailSchema,
    });
  }
  return apiServer(`/api/public/posts/${encodeURIComponent(slug)}`, {
    locale,
    tags: ['posts', `post:${slug}`],
    schema: publicPostDetailSchema,
  });
}

export async function getPostOrNull(
  slug: string,
  locale: Locale,
): Promise<PublicPostDetail | null> {
  try {
    return await getPost(slug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function listPublishedPostSlugs(): Promise<string[]> {
  try {
    const page = await listPostsPage('en', { pageSize: 100, sort: '-publishedAt' });
    return page.items.map((item) => item.slug);
  } catch {
    return [];
  }
}
