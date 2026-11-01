'use client';

import type { ContactMessageStatus } from '@portfolio/contracts';
import {
  adminContactMessageListParamsSchema,
  CONTACT_MESSAGE_STATUSES,
} from '@portfolio/contracts';
import { FilterBar } from '@portfolio/ui/components/FilterBar/FilterBar';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { type ReactNode, useId } from 'react';

import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';

import { InboxList } from '../components/InboxList/InboxList';
import { useAdminMessages } from '../hooks/use-admin-inbox.hook';

export function AdminInboxLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('admin.inbox');
  const table = useTranslations('admin.table');
  const headingId = useId();
  const { id } = useParams<{ id?: string }>();
  const selectedId = id ? Number(id) : undefined;
  const query = useSearchParams().toString();
  const { params, setParams } = useListParams(adminContactMessageListParamsSchema);
  const { data, isError, refetch, isPending } = useAdminMessages(params);
  const list = data ?? { items: [], page: params.page, pageSize: params.pageSize, total: 0 };
  const status = params.status;
  const Heading = selectedId ? 'h2' : 'h1';

  return (
    <div className="admin-inbox" data-selected={selectedId ? 'true' : 'false'}>
      <section className="admin-inbox-list" aria-labelledby={headingId}>
        <Heading id={headingId} className="text-ui-title font-semibold">
          {t('title')}
        </Heading>
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
          onAddFilter={(value) => setParams({ status: value as ContactMessageStatus, page: 1 })}
          labels={{ add: t('addFilter'), remove: t('removeChip') }}
        />
        <InboxList
          label={t('messages')}
          items={list.items}
          selectedId={selectedId}
          hrefFor={(item) => `/admin/inbox/${item.id}${query ? `?${query}` : ''}`}
          total={list.total}
          page={list.page}
          pageSize={list.pageSize}
          hasFilters={Boolean(params.q || params.status)}
          isLoading={isPending}
          isError={isError}
          labels={{
            empty: t('empty'),
            noResults: t('noResults'),
            clearFilters: t('clearFilters'),
            error: t('error'),
            retry: t('retry'),
            range: (values) => t('range', values),
            previous: table('previous'),
            next: table('next'),
            noTopic: t('noTopic'),
          }}
          statusLabels={{
            NEW: t('status.NEW'),
            READ: t('status.READ'),
            REPLIED: t('status.REPLIED'),
            SPAM: t('status.SPAM'),
            ARCHIVED: t('status.ARCHIVED'),
          }}
          onPageChange={(page) => setParams({ page })}
          onClearFilters={() => setParams({ q: undefined, status: undefined, page: 1 })}
          onRetry={() => void refetch()}
        />
      </section>
      <div className="admin-inbox-message">{children}</div>
    </div>
  );
}
