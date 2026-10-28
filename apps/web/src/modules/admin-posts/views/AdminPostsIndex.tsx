'use client';

import { type AdminTag, adminPostListParamsSchema, adminTagSchema, qk } from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { Button } from '@portfolio/ui/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';
import { useBulkArchivePosts } from '@/modules/admin-insights/hooks/use-admin-audit.hook';
import { adminTableLabels } from '@/modules/admin-core/utils/table-labels.util';
import { apiClient } from '@/modules/core/services/api-client.service';

import { PostsTable } from '../components/PostsTable/PostsTable';
import {
  useAdminPosts,
  useArchiveAdminPost,
  usePrefetchAdminPost,
} from '../hooks/use-admin-posts.hook';

export function AdminPostsIndex() {
  const t = useTranslations('admin.posts');
  const table = useTranslations('admin.table');
  const router = useRouter();
  const canWrite = useIsAdmin();
  const { params, setParams } = useListParams(adminPostListParamsSchema);
  const { data, isError, refetch, isPending, isFetching } = useAdminPosts(params);
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const archive = useArchiveAdminPost(params);
  const bulkArchive = useBulkArchivePosts();
  const prefetch = usePrefetchAdminPost();
  const tags = useQuery({
    queryKey: qk.admin.all('tags'),
    queryFn: async () =>
      z.array(adminTagSchema).parse(await apiClient<AdminTag[]>('/api/admin/tags')),
  });

  const hasFilters = Boolean(params.q || params.status || params.tag);
  const chips = [
    params.status
      ? { id: 'status', label: t('chip.status', { status: t(`status.${params.status}`) }) }
      : null,
    params.tag ? { id: 'tag', label: t('chip.tag', { tag: params.tag }) } : null,
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        {canWrite ? (
          <Button type="button" size="sm" onClick={() => router.push('/admin/posts/new')}>
            {t('new')}
          </Button>
        ) : null}
      </div>
      <FilterBar
        q={params.q ?? ''}
        onQChange={(q) => setParams({ q: q || undefined, page: 1 })}
        placeholder={t('search')}
        chips={chips}
        onRemoveChip={(id) =>
          setParams(id === 'status' ? { status: undefined, page: 1 } : { tag: undefined, page: 1 })
        }
        filters={[
          { id: 'DRAFT', label: t('status.DRAFT') },
          { id: 'PUBLISHED', label: t('status.PUBLISHED') },
          { id: 'ARCHIVED', label: t('status.ARCHIVED') },
          ...(tags.data ?? []).map((tag) => ({
            id: `tag:${tag.slug}`,
            label: tag.nameEn,
          })),
        ]}
        onAddFilter={(id) => {
          if (id.startsWith('tag:')) {
            setParams({ tag: id.slice(4), page: 1 });
            return;
          }
          setParams({ status: id as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', page: 1 });
        }}
        labels={{ add: t('addFilter'), remove: t('removeChip') }}
      />
      <PostsTable
        items={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sort={params.sort}
        hasFilters={hasFilters}
        isError={isError}
        isLoading={isPending}
        isFetching={isFetching}
        canWrite={canWrite}
        labels={adminTableLabels(table, {
          empty: t('empty'),
          emptyAction: t('new'),
          noResults: t('noResults'),
          clearFilters: t('clearFilters'),
          error: t('error'),
          selected: t('selected'),
          range: t('range'),
          confirmDeleteTitle: t('confirmArchiveTitle'),
          confirmDelete: t('confirmArchive'),
          bulkDelete: t('archive'),
        })}
        columnLabels={{
          title: t('columns.title'),
          status: t('columns.status'),
          tags: t('columns.tags'),
          reading: t('columns.reading'),
          published: t('columns.published'),
          updated: t('columns.updated'),
          actions: t('columns.actions'),
        }}
        statusLabels={{
          draft: t('status.DRAFT'),
          published: t('status.PUBLISHED'),
          archived: t('status.ARCHIVED'),
        }}
        readingLabel={(minutes) => t('readingMinutes', { minutes })}
        onSortChange={(sort) => {
          const parsed = adminPostListParamsSchema.shape.sort.safeParse(sort);
          if (parsed.success) {
            setParams({ sort: parsed.data, page: 1 });
          }
        }}
        onPageChange={(page) => setParams({ page })}
        onOpen={(row) => router.push(`/admin/posts/${row.id}`)}
        onEdit={(row) => router.push(`/admin/posts/${row.id}`)}
        onDelete={(row) => archive.mutate(row.id)}
        onBulkDelete={(rows) => bulkArchive.mutate(rows)}
        onCreate={() => router.push('/admin/posts/new')}
        onClearFilters={() =>
          setParams({ q: undefined, status: undefined, tag: undefined, page: 1 })
        }
        onRetry={() => {
          void refetch();
        }}
        onPrefetch={(id) => prefetch.prefetch(id)}
      />
    </div>
  );
}
