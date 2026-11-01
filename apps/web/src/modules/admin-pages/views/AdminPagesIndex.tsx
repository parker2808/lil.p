'use client';

import type { AdminPageListItem } from '@portfolio/contracts';
import { AdminTable, type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminPages } from '../hooks/use-admin-page.hook';

export function AdminPagesIndex() {
  const t = useTranslations('admin.pages');
  const pages = useAdminPages();

  const columns: AdminTableColumn<AdminPageListItem>[] = [
    {
      id: 'page',
      header: t('page'),
      cell: (page) => <span className="text-ui font-medium">{t(`names.${page.key}`)}</span>,
    },
    {
      id: 'blocks',
      header: t('blocks'),
      cell: (page) => <span className="tabular-nums">{page.blockCount}</span>,
    },
    {
      id: 'status',
      header: t('status'),
      cell: (page) =>
        page.hasUnpublishedChanges ? (
          <Badge variant="warning">{t('unpublished')}</Badge>
        ) : (
          <Badge variant="success">{t('published')}</Badge>
        ),
    },
    {
      id: 'updated',
      header: t('updated'),
      cell: (page) => (
        <span className="text-ui-meta text-muted-foreground tabular-nums">
          {page.updatedAt.slice(0, 10)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      <AdminTable
        label={t('title')}
        columns={columns}
        data={pages.data ?? []}
        rowId={(page) => page.key}
        rowHref={(page) => `/admin/pages/${page.key}`}
        linkComponent={Link}
        isLoading={pages.isPending}
        isError={pages.isError}
        empty={<p className="text-ui text-muted-foreground">{t('empty')}</p>}
        error={
          <ErrorState
            message={t('loadError')}
            retryLabel={t('retry')}
            onRetry={() => void pages.refetch()}
          />
        }
      />
    </div>
  );
}
