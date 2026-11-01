'use client';

import type { AdminContactMessage, ContactMessageStatus } from '@portfolio/contracts';
import { formatDateTime } from '@portfolio/ui/components/AuditRow/relative-time.util';
import { EmptyState } from '@portfolio/ui/components/EmptyState/EmptyState';
import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { cn } from '@portfolio/ui/lib/utils';
import { useLocale } from 'next-intl';
import Link from 'next/link';

const STATUS_VARIANT = {
  REPLIED: 'success',
  SPAM: 'outline',
  ARCHIVED: 'neutral',
} as const;

export type InboxListLabels = {
  empty: string;
  noResults: string;
  clearFilters: string;
  error: string;
  retry: string;
  range: (values: { from: number; to: number; total: number }) => string;
  previous: string;
  next: string;
  noTopic: string;
};

export function InboxList({
  label,
  items,
  selectedId,
  hrefFor,
  total,
  page,
  pageSize,
  hasFilters,
  isLoading,
  isError,
  labels,
  statusLabels,
  onPageChange,
  onClearFilters,
  onRetry,
}: {
  label: string;
  items: AdminContactMessage[];
  selectedId?: number;
  hrefFor: (item: AdminContactMessage) => string;
  total: number;
  page: number;
  pageSize: number;
  hasFilters: boolean;
  isLoading?: boolean;
  isError?: boolean;
  labels: InboxListLabels;
  statusLabels: Record<ContactMessageStatus, string>;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  const locale = useLocale();

  if (isError) {
    return <ErrorState message={labels.error} retryLabel={labels.retry} onRetry={onRetry} />;
  }

  if (isLoading && items.length === 0) {
    return (
      <ul aria-busy className="flex flex-col gap-1" aria-label={label}>
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return hasFilters ? (
      <EmptyState
        title={labels.noResults}
        action={
          <Button type="button" size="sm" variant="outline" onClick={onClearFilters}>
            {labels.clearFilters}
          </Button>
        }
      />
    ) : (
      <EmptyState title={labels.empty} />
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1" aria-label={label}>
        {items.map((item) => {
          const unread = item.status === 'NEW';
          const badge = item.status === 'NEW' || item.status === 'READ' ? null : item.status;
          return (
            <li key={item.id}>
              <Link
                href={hrefFor(item)}
                aria-current={item.id === selectedId ? 'page' : undefined}
                data-status={item.status}
                className="admin-inbox-row"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn('size-2 shrink-0 rounded-full', unread && 'bg-primary')}
                  />
                  <span className={cn('min-w-0 flex-1 truncate', unread && 'font-semibold')}>
                    {item.name}
                  </span>{' '}
                  {unread ? <span className="sr-only">{statusLabels.NEW} </span> : null}
                  <time
                    dateTime={item.createdAt}
                    className="text-ui-meta text-muted-foreground shrink-0"
                  >
                    {formatDateTime(item.createdAt, locale)}
                  </time>
                </span>{' '}
                <span className="flex items-center gap-2 pl-4">
                  <span className="text-ui-meta min-w-0 flex-1 truncate">
                    {item.topic?.labelEn ?? labels.noTopic}
                  </span>{' '}
                  {badge ? (
                    <Badge variant={STATUS_VARIANT[badge]}>{statusLabels[badge]}</Badge>
                  ) : null}
                </span>{' '}
                <span className="text-ui-meta text-muted-foreground truncate pl-4">
                  {item.message}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {total > pageSize ? (
        <div className="text-ui-meta text-muted-foreground flex items-center justify-between gap-2">
          <span>{labels.range({ from, to, total })}</span>
          <span className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {labels.previous}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={to >= total}
              onClick={() => onPageChange(page + 1)}
            >
              {labels.next}
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
