'use client';

import type { ContactMessageStatus } from '@portfolio/contracts';
import {
  adminContactMessageListParamsSchema,
  CONTACT_MESSAGE_STATUSES,
} from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { adminTableLabels } from '@/modules/admin-core/utils/table-labels.util';

import { InboxTable } from '../components/InboxTable/InboxTable';
import { useAdminMessages, useInboxMutations } from '../hooks/use-admin-inbox.hook';

export function AdminInboxIndex() {
  const t = useTranslations('admin.inbox');
  const table = useTranslations('admin.table');
  const canWrite = useIsAdmin();
  const router = useRouter();
  const { params, setParams } = useListParams(adminContactMessageListParamsSchema);
  const { data, isError, refetch } = useAdminMessages(params);
  const mutations = useInboxMutations();
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const status = params.status;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      <FilterBar
        q={params.q ?? ''}
        onQChange={(q) => setParams({ q: q || undefined, page: 1 })}
        placeholder={t('search')}
        chips={status ? [{ id: status, label: t(`status.${status}`) }] : []}
        onRemoveChip={() => setParams({ status: undefined, page: 1 })}
        filters={CONTACT_MESSAGE_STATUSES.map((value) => ({
          id: value,
          label: t(`status.${value}`),
        }))}
        onAddFilter={(id) => setParams({ status: id as ContactMessageStatus, page: 1 })}
        labels={{ add: t('addFilter'), remove: t('removeChip') }}
      />
      <InboxTable
        items={list.items}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sort={params.sort}
        hasFilters={Boolean(params.q || params.status)}
        isError={isError}
        canWrite={canWrite}
        labels={adminTableLabels(table, {
          empty: t('empty'),
          emptyAction: t('emptyAction'),
          noResults: t('noResults'),
          clearFilters: t('clearFilters'),
          error: t('error'),
          selected: t('selected'),
          range: t('range'),
          confirmDeleteTitle: t('confirmSpamTitle'),
          confirmDelete: t('confirmSpam'),
          bulkDelete: t('markSpam'),
        })}
        columnLabels={{
          name: t('columns.name'),
          topic: t('columns.topic'),
          status: t('columns.status'),
          created: t('columns.created'),
          actions: t('columns.actions'),
        }}
        statusLabels={{
          NEW: t('status.NEW'),
          READ: t('status.READ'),
          REPLIED: t('status.REPLIED'),
          SPAM: t('status.SPAM'),
        }}
        actionLabels={{ read: t('markRead'), spam: t('markSpam') }}
        onSortChange={(sort) => setParams({ sort: sort as typeof params.sort, page: 1 })}
        onPageChange={(page) => setParams({ page })}
        onOpen={(row) => router.push(`/admin/inbox/${row.id}`)}
        onMarkRead={(row) => mutations.setStatus.mutate({ id: row.id, status: 'READ' })}
        onMarkSpam={(row) => mutations.setStatus.mutate({ id: row.id, status: 'SPAM' })}
        onClearFilters={() => setParams({ q: undefined, status: undefined, page: 1 })}
        onRetry={() => void refetch()}
      />
    </div>
  );
}
