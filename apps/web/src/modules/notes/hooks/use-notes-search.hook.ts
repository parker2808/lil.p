'use client';

import type { Locale, PostListParams, PublicPostListPage } from '@portfolio/contracts';
import { qk } from '@portfolio/contracts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listPostsPageClient } from '../services/posts-client.service';

export function useNotesSearch({
  locale,
  params,
  initialData,
  enabled = true,
}: {
  locale: Locale;
  params: Partial<PostListParams>;
  initialData?: PublicPostListPage;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: qk.public.posts({ locale, ...params }),
    queryFn: ({ signal }) => listPostsPageClient(locale, params, signal),
    placeholderData: keepPreviousData,
    initialData: params.q ? undefined : initialData,
    enabled,
  });
}
