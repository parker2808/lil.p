'use client';

import { adminExperienceListParamsSchema } from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { Button } from '@portfolio/ui/components/ui/button';
import { formatMonthYear } from '@portfolio/ui/components/AuditRow/relative-time.util';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';
import { adminListTableLabels } from '@/modules/admin-core/utils/table-labels.util';

import { ExperienceTable } from '../components/ExperienceTable/ExperienceTable';
import {
  useAdminExperience,
  useMoveAdminExperience,
  usePrefetchAdminExperience,
  useRemoveAdminExperience,
  useToggleExperienceVisible,
} from '../hooks/use-admin-experience.hook';

export function AdminAboutExperienceIndex() {
  const t = useTranslations('admin.experience');
  const locale = useLocale();
  const table = useTranslations('admin.table');
  const router = useRouter();
  const canWrite = useIsAdmin();
  const { params, setParams } = useListParams(adminExperienceListParamsSchema);
  const { data, isError, refetch, isPending } = useAdminExperience(params);
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const toggle = useToggleExperienceVisible(params);
  const remove = useRemoveAdminExperience(params);
  const move = useMoveAdminExperience();
  const prefetch = usePrefetchAdminExperience();

  const hasFilters = Boolean(params.q || params.visible);
  const chips = [
    params.visible === '1' || params.visible === 'true'
      ? { id: 'visible', label: t('chip.visible') }
      : null,
    params.visible === '0' || params.visible === 'false'
      ? { id: 'visible', label: t('chip.hidden') }
      : null,
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        {canWrite ? (
          <Button type="button" size="sm" onClick={() => router.push('/admin/experience/new')}>
            {t('new')}
          </Button>
        ) : null}
      </div>
      <FilterBar
        q={params.q ?? ''}
        onQChange={(q) => setParams({ q: q || undefined, page: 1 })}
        placeholder={t('search')}
        chips={chips}
        onRemoveChip={() => setParams({ visible: undefined, page: 1 })}
        filters={[
          { id: 'visible', label: t('visible.on') },
          { id: 'hidden', label: t('visible.off') },
        ]}
        onAddFilter={(id) => {
          setParams({ visible: id === 'hidden' ? '0' : '1', page: 1 });
        }}
        labels={{ add: t('addFilter'), remove: t('removeChip') }}
      />
      <ExperienceTable
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
          confirmArchiveTitle: t('confirmDeleteTitle'),
          confirmArchive: t('confirmDelete'),
          archive: t('delete'),
        })}
        columnLabels={{
          company: t('columns.company'),
          role: t('columns.role'),
          dates: t('columns.dates'),
          visible: t('columns.visible'),
          actions: t('columns.actions'),
        }}
        formatDates={(start, end) =>
          t('datesValue', {
            start: formatMonthYear(start, locale),
            end: end ? formatMonthYear(end, locale) : t('now'),
          })
        }
        onSortChange={(sort) => {
          const parsed = adminExperienceListParamsSchema.shape.sort.safeParse(sort);
          if (parsed.success) {
            setParams({ sort: parsed.data, page: 1 });
          }
        }}
        onPageChange={(page) => setParams({ page })}
        onDelete={(row) => remove.mutate(row.id)}
        onBulkDelete={(rows) => {
          for (const row of rows) {
            remove.mutate(row.id);
          }
        }}
        onCreate={() => router.push('/admin/experience/new')}
        onClearFilters={() => setParams({ q: undefined, visible: undefined, page: 1 })}
        onRetry={() => {
          void refetch();
        }}
        onPrefetch={(id) => prefetch.prefetch(id)}
        onMove={(id, direction) => move.mutate({ id, direction })}
        onToggleVisible={(row) => toggle.mutate(row)}
      />
    </div>
  );
}
