'use client';

import {
  AUDIT_ENTITY_TYPES,
  type AdminAuditLog,
  type AdminUser,
  adminUserListPageSchema,
  qk,
} from '@portfolio/contracts';
import { AuditRow } from '@portfolio/ui/components/AuditRow/AuditRow';
import { Button } from '@portfolio/ui/components/ui/button';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { apiClient } from '@/modules/core/services/api-client.service';

import { flattenAuditPages, useAdminAuditInfinite } from '../hooks/use-admin-audit.hook';

const ROW_HEIGHT = 64;

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
        <label className="text-ui flex flex-col gap-1">
          {t('entityType')}
          <select
            className="border-input bg-background h-9 rounded-md border px-2"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          >
            <option value="">{t('allEntities')}</option>
            {AUDIT_ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-ui flex flex-col gap-1">
          {t('user')}
          <select
            className="border-input bg-background h-9 rounded-md border px-2"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            <option value="">{t('allUsers')}</option>
            {(users.data?.items ?? []).map((user: AdminUser) => (
              <option key={user.id} value={String(user.id)}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
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
      {query.isError ? (
        <div className="flex flex-col gap-2">
          <p className="text-ui text-muted-foreground">{t('error')}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : (
        <AuditVirtualList
          items={items}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              void query.fetchNextPage();
            }
          }}
          empty={t('empty')}
        />
      )}
    </div>
  );
}

export function AuditVirtualList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  empty,
}: {
  items: AdminAuditLog[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  empty: string;
}) {
  const t = useTranslations('admin.audit');
  const parentRef = useRef<HTMLDivElement>(null);
  const count = items.length + (hasNextPage ? 1 : 0);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    initialRect: { width: 800, height: 384 },
  });
  const labels = useMemo(
    () => ({
      actions: {
        CREATE: t('actions.CREATE'),
        UPDATE: t('actions.UPDATE'),
        PUBLISH: t('actions.PUBLISH'),
        ARCHIVE: t('actions.ARCHIVE'),
        RESTORE: t('actions.RESTORE'),
        LOGIN: t('actions.LOGIN'),
      },
      system: t('system'),
    }),
    [t],
  );
  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;

  useEffect(() => {
    if (items.length === 0) {
      return;
    }
    if (lastIndex >= items.length - 8) {
      onLoadMore?.();
    }
  }, [items.length, lastIndex, onLoadMore]);

  if (items.length === 0) {
    return <p className="text-ui text-muted-foreground">{empty}</p>;
  }

  return (
    <div ref={parentRef} data-slot="audit-list" tabIndex={0} className="h-96 overflow-auto">
      <ul className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualItems.map((row) => {
          const item = items[row.index];
          return (
            <li
              key={item?.id ?? `more-${row.index}`}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              {item ? (
                <AuditRow item={item} labels={labels} />
              ) : (
                <Skeleton className="h-10 w-full" />
              )}
            </li>
          );
        })}
      </ul>
      {isFetchingNextPage ? <Skeleton className="mt-2 h-8 w-full" /> : null}
    </div>
  );
}
