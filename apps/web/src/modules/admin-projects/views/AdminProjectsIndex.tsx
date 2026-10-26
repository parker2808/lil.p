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
  const { data, isError, refetch } = useAdminProjects(params);
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
        items={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sort={params.sort}
        hasFilters={hasFilters}
        isError={isError}
        canWrite={canWrite}
        labels={{
          empty: t('empty'),
          emptyAction: t('new'),
          noResults: t('noResults'),
          clearFilters: t('clearFilters'),
          error: t('error'),
          retry: table('retry'),
          selected: t('selected'),
          previous: table('previous'),
          next: table('next'),
          range: t('range'),
          columns: table('columns'),
          density: table('density'),
          densityDefault: table('densityDefault'),
          densityCompact: table('densityCompact'),
          help: table('help'),
          helpTitle: table('helpTitle'),
          confirmDeleteTitle: t('confirmArchiveTitle'),
          confirmDelete: t('confirmArchive'),
          cancel: table('cancel'),
          bulkDelete: t('archive'),
          shortcuts: {
            move: table('shortcuts.move'),
            select: table('shortcuts.select'),
            open: table('shortcuts.open'),
            edit: table('shortcuts.edit'),
            remove: table('shortcuts.remove'),
            help: table('shortcuts.help'),
            keys: {
              j: table('keys.j'),
              k: table('keys.k'),
              x: table('keys.x'),
              enter: table('keys.enter'),
              e: table('keys.e'),
              backspace: table('keys.backspace'),
              help: table('keys.help'),
            },
          },
        }}
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
        onOpen={(row) => router.push(`/admin/projects/${row.id}`)}
        onEdit={(row) => router.push(`/admin/projects/${row.id}`)}
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
