'use client';

import { type AdminPageListItem, corePageKeySchema } from '@portfolio/contracts';
import { AdminTable, type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { formatDateTime } from '@portfolio/ui/components/AuditRow/relative-time.util';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState, type MouseEvent } from 'react';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { Button } from '@portfolio/ui/components/ui/button';
import { CreatePageDialog } from '../components/CreatePageDialog/CreatePageDialog';
import Link from 'next/link';

import { useAdminPages } from '../hooks/use-admin-page.hook';

export function AdminPagesIndex() {
  const t = useTranslations('admin.pages');
  const locale = useLocale();
  const pages = useAdminPages();
  const isAdmin = useIsAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const createTrigger = useRef<HTMLElement | null>(null);

  function openCreate(event: MouseEvent<HTMLButtonElement>) {
    createTrigger.current = event.currentTarget;
    setCreateOpen(true);
  }

  const columns: AdminTableColumn<AdminPageListItem>[] = [
    {
      id: 'page',
      header: t('page'),
      cell: (page) => (
        <span className="text-ui font-medium">
          {page.title ??
            (corePageKeySchema.safeParse(page.key).success ? t(`names.${page.key}`) : page.key)}
        </span>
      ),
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
          {formatDateTime(page.updatedAt, locale)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        {isAdmin ? (
          <Button type="button" className="min-h-11" onClick={openCreate}>
            {t('create.title')}
          </Button>
        ) : null}
      </div>
      {isAdmin ? (
        <CreatePageDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          existingKeys={(pages.data ?? []).map((page) => page.key)}
          returnFocusTo={createTrigger}
        />
      ) : null}
      <AdminTable
        label={t('title')}
        columns={columns}
        data={pages.data ?? []}
        rowId={(page) => page.key}
        rowHref={(page) => `/admin/pages/${page.key}`}
        linkComponent={Link}
        isLoading={pages.isPending}
        isError={pages.isError}
        empty={
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-ui text-muted-foreground">{t('empty')}</p>
            {isAdmin ? (
              <Button type="button" className="min-h-11" onClick={openCreate}>
                {t('create.title')}
              </Button>
            ) : null}
          </div>
        }
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
