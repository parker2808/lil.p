'use client';

import {
  type AdminDomain,
  adminDomainSchema,
  adminProjectListParamsSchema,
  qk,
} from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { Button } from '@portfolio/ui/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';
import { adminListTableLabels } from '@/modules/admin-core/utils/table-labels.util';
import { useBulkArchiveProjects } from '@/modules/admin-insights/hooks/use-admin-audit.hook';
import { apiClient } from '@/modules/core/services/api-client.service';

import { ProjectsTable } from '../components/ProjectsTable/ProjectsTable';
import {
  useAdminProjects,
  useArchiveAdminProject,
  useMoveAdminProject,
  usePrefetchAdminProject,
} from '../hooks/use-admin-projects.hook';

export function AdminProjectsIndex() {
  const t = useTranslations('admin.projects');
  const table = useTranslations('admin.table');
  const router = useRouter();
  const canWrite = useIsAdmin();
  const { params, setParams } = useListParams(adminProjectListParamsSchema);
  const { data, isError, refetch, isPending } = useAdminProjects(params);
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const archive = useArchiveAdminProject(params);
  const bulkArchive = useBulkArchiveProjects();
  const move = useMoveAdminProject();
  const prefetch = usePrefetchAdminProject();
  const domains = useQuery({
    queryKey: qk.admin.all('domains'),
    queryFn: async () =>
      z.array(adminDomainSchema).parse(await apiClient<AdminDomain[]>('/api/admin/domains')),
  });

  const hasFilters = Boolean(params.q || params.status || params.domain);
  const chips = [
    params.status
      ? { id: 'status', label: t('chip.status', { status: t(`status.${params.status}`) }) }
      : null,
    params.domain ? { id: 'domain', label: t('chip.domain', { domain: params.domain }) } : null,
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        {canWrite ? (
          <Button type="button" size="sm" onClick={() => router.push('/admin/projects/new')}>
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
          setParams(
            id === 'status' ? { status: undefined, page: 1 } : { domain: undefined, page: 1 },
          )
        }
        filters={[
          { id: 'DRAFT', label: t('status.DRAFT') },
          { id: 'PUBLISHED', label: t('status.PUBLISHED') },
          { id: 'ARCHIVED', label: t('status.ARCHIVED') },
          ...(domains.data ?? []).map((domain) => ({
            id: `domain:${domain.slug}`,
            label: domain.nameEn,
          })),
        ]}
        onAddFilter={(id) => {
          if (id.startsWith('domain:')) {
            setParams({ domain: id.slice(7), page: 1 });
            return;
          }
          setParams({ status: id as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', page: 1 });
        }}
        labels={{ add: t('addFilter'), remove: t('removeChip') }}
      />
      <ProjectsTable
        label={t('title')}
        items={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sort={params.sort}
        hasFilters={hasFilters}
        isError={isError}
        isLoading={isPending}
        canWrite={canWrite}
        labels={adminListTableLabels(table, {
          empty: t('empty'),
          emptyAction: t('new'),
          noResults: t('noResults'),
          clearFilters: t('clearFilters'),
          error: t('error'),
          selected: t('selected'),
          range: t('range'),
          confirmArchiveTitle: t('confirmArchiveTitle'),
          confirmArchive: t('confirmArchive'),
          archive: t('archive'),
        })}
        moveLabels={{ up: t('editor.moveUp'), down: t('editor.moveDown') }}
        columnLabels={{
          title: t('columns.title'),
          domain: t('columns.domain'),
          keyFacts: t('columns.keyFacts'),
          status: t('columns.status'),
          updated: t('columns.updated'),
          actions: t('columns.actions'),
        }}
        statusLabels={{
          draft: t('status.DRAFT'),
          published: t('status.PUBLISHED'),
          archived: t('status.ARCHIVED'),
        }}
        onSortChange={(sort) => {
          const parsed = adminProjectListParamsSchema.shape.sort.safeParse(sort);
          if (parsed.success) {
            setParams({ sort: parsed.data, page: 1 });
          }
        }}
        onPageChange={(page) => setParams({ page })}
        onDelete={(row) => archive.mutate(row.id)}
        onBulkDelete={(rows) => bulkArchive.mutate(rows)}
        onCreate={() => router.push('/admin/projects/new')}
        onClearFilters={() =>
          setParams({ q: undefined, status: undefined, domain: undefined, page: 1 })
        }
        onRetry={() => {
          void refetch();
        }}
        onPrefetch={(id) => prefetch.prefetch(id)}
        onMove={(id, direction) => move.mutate({ id, direction })}
      />
    </div>
  );
}
