'use client';

import type { AdminPostListItem } from '@portfolio/contracts';
import { StatusPill } from '@portfolio/ui/components/StatusPill/StatusPill';
import { type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { Badge } from '@portfolio/ui/components/ui/badge';

import {
  AdminListTable,
  type AdminListTableLabels,
} from '@/modules/admin-core/components/AdminListTable/AdminListTable';

const STATUS_KEY = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export function PostsTable({
  label,
  items,
  total,
  page,
  pageSize,
  sort,
  hasFilters,
  isError,
  isLoading,
  canWrite,
  labels,
  columnLabels,
  statusLabels,
  readingLabel,
  onSortChange,
  onPageChange,
  onDelete,
  onBulkDelete,
  onCreate,
  onClearFilters,
  onRetry,
  onPrefetch,
}: {
  label: string;
  items: AdminPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  hasFilters: boolean;
  isError?: boolean;
  isLoading?: boolean;
  canWrite: boolean;
  labels: AdminListTableLabels;
  columnLabels: {
    title: string;
    status: string;
    tags: string;
    reading: string;
    published: string;
    updated: string;
  };
  statusLabels: { draft: string; published: string; archived: string };
  readingLabel: (minutes: number) => string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (row: AdminPostListItem) => void;
  onBulkDelete: (rows: AdminPostListItem[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
}) {
  const columns: AdminTableColumn<AdminPostListItem>[] = [
    {
      id: 'titleEn',
      header: columnLabels.title,
      cell: (row) => (
        <div onMouseEnter={() => onPrefetch(row.id)} onFocus={() => onPrefetch(row.id)}>
          <p className="text-ui font-medium">{row.titleEn}</p>
          <p className="text-ui-meta text-muted-foreground font-mono">{row.slug}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: columnLabels.status,
      cell: (row) => <StatusPill status={STATUS_KEY[row.status]} labels={statusLabels} />,
    },
    {
      id: 'tags',
      header: columnLabels.tags,
      cell: (row) =>
        row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="normal-case">
                {tag.nameEn}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'readingMinutes',
      header: columnLabels.reading,
      cell: (row) => <span className="tabular-nums">{readingLabel(row.readingMinutes)}</span>,
    },
    {
      id: 'publishedAt',
      header: columnLabels.published,
      sortable: true,
      cell: (row) => (
        <span className="text-ui-meta text-muted-foreground tabular-nums">
          {row.publishedAt ? row.publishedAt.slice(0, 10) : '—'}
        </span>
      ),
    },
    {
      id: 'updatedAt',
      header: columnLabels.updated,
      sortable: true,
      cell: (row) => (
        <span className="text-ui-meta text-muted-foreground tabular-nums">
          {formatRelative(row.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <AdminListTable
      label={label}
      columns={columns}
      items={items}
      rowId={(row) => String(row.id)}
      rowLabel={(row) => row.titleEn}
      rowHref={(row) => `/admin/posts/${row.id}`}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      hasFilters={hasFilters}
      isLoading={isLoading}
      isError={isError}
      canWrite={canWrite}
      labels={labels}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onClearFilters={onClearFilters}
      onRetry={onRetry}
    />
  );
}

export function formatRelative(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}
