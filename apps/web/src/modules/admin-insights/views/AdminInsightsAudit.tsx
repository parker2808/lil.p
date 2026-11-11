'use client';

import {
  AUDIT_ENTITY_TYPES,
  type AdminAuditLog,
  type AdminUser,
  adminUserListPageSchema,
  qk,
} from '@portfolio/contracts';
import { AdminTable, type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { AuditActionBadge } from '@portfolio/ui/components/AuditRow/AuditRow';
import {
  formatDateTime,
  formatRelativeTime,
} from '@portfolio/ui/components/AuditRow/relative-time.util';
import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { apiClient } from '@/modules/core/services/api-client.service';

import { flattenAuditPages, useAdminAuditInfinite } from '../hooks/use-admin-audit.hook';

export function AdminInsightsAudit() {
  const t = useTranslations('admin.audit');
  const [entityType, setEntityType] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const params = {
    limit: 50,
    entityType: entityType || undefined,
    userId: userId ? Number(userId) : undefined,
  };
  const query = useAdminAuditInfinite(params);
  const items = flattenAuditPages(query.data?.pages);
  const users = useQuery({
    queryKey: qk.admin.list('users', { page: 1, pageSize: 100, sort: 'name' }),
    queryFn: async () =>
      adminUserListPageSchema.parse(
        await apiClient<unknown>('/api/admin/users?page=1&pageSize=100&sort=name'),
      ),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      <div className="flex flex-wrap items-end gap-3">
        <div className="text-ui flex flex-col gap-1">
          <label htmlFor="audit-entity-type">{t('entityType')}</label>
          <Select
            value={entityType || 'all'}
            onValueChange={(next) => setEntityType(next === 'all' ? '' : next)}
          >
            <SelectTrigger id="audit-entity-type" className="w-auto min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allEntities')}</SelectItem>
              {AUDIT_ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-ui flex flex-col gap-1">
          <label htmlFor="audit-user">{t('user')}</label>
          <Select
            value={userId || 'all'}
            onValueChange={(next) => setUserId(next === 'all' ? '' : next)}
          >
            <SelectTrigger id="audit-user" className="w-auto min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allUsers')}</SelectItem>
              {(users.data?.items ?? []).map((user: AdminUser) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {entityType || userId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEntityType('');
              setUserId('');
            }}
          >
            {t('clearFilters')}
          </Button>
        ) : null}
      </div>
      <AuditTable
        items={items}
        isLoading={query.isPending}
        isError={query.isError}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
        onRetry={() => void query.refetch()}
      />
    </div>
  );
}

export function AuditTable({
  items,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
}: {
  items: AdminAuditLog[];
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}) {
  const t = useTranslations('admin.audit');
  const locale = useLocale();
  const columns: AdminTableColumn<AdminAuditLog>[] = [
    {
      id: 'action',
      header: t('action'),
      cell: (item) => <AuditActionBadge action={item.action} label={t(`actions.${item.action}`)} />,
    },
    { id: 'summary', header: t('summary'), cell: (item) => item.summary },
    { id: 'user', header: t('user'), cell: (item) => item.userName ?? t('system') },
    {
      id: 'time',
      header: t('time'),
      cell: (item) => (
        <time
          className="text-muted-foreground whitespace-nowrap"
          dateTime={item.createdAt}
          title={formatDateTime(item.createdAt, locale)}
        >
          {formatRelativeTime(item.createdAt, Date.now(), locale)}
        </time>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <AdminTable
        label={t('title')}
        columns={columns}
        data={items}
        rowId={(item) => String(item.id)}
        isLoading={isLoading}
        isError={isError}
        empty={<p className="text-ui text-muted-foreground">{t('empty')}</p>}
        error={<ErrorState message={t('error')} retryLabel={t('retry')} onRetry={onRetry} />}
      />
      {hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          loading={isFetchingNextPage}
          onClick={onLoadMore}
        >
          {t('loadMore')}
        </Button>
      ) : null}
    </div>
  );
}
