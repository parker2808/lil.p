'use client';

import type { AdminPostListItem } from '@portfolio/contracts';
import { DataTable, type DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';
import { StatusPill } from '@portfolio/ui/components/StatusPill/StatusPill';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

const STATUS_KEY = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export function PostsTable({
  items,
  total,
  page,
  pageSize,
  sort,
  hasFilters,
  isError,
  canWrite,
  labels,
  columnLabels,
  statusLabels,
  readingLabel,
  onSortChange,
  onPageChange,
  onOpen,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onClearFilters,
  onRetry,
  onPrefetch,
}: {
  items: AdminPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  hasFilters: boolean;
  isError?: boolean;
  canWrite: boolean;
  labels: DataTableLabels;
  columnLabels: {
    title: string;
    status: string;
    tags: string;
    reading: string;
    published: string;
    updated: string;
    actions: string;
  };
  statusLabels: { draft: string; published: string; archived: string };
  readingLabel: (minutes: number) => string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onOpen: (row: AdminPostListItem) => void;
  onEdit: (row: AdminPostListItem) => void;
  onDelete: (row: AdminPostListItem) => void;
  onBulkDelete: (rows: AdminPostListItem[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
}) {
  const columns = useMemo<ColumnDef<AdminPostListItem>[]>(
    () => [
      {
        id: 'titleEn',
        accessorKey: 'titleEn',
        header: columnLabels.title,
        cell: ({ row }) => (
          <div
            onMouseEnter={() => onPrefetch(row.original.id)}
            onFocus={() => onPrefetch(row.original.id)}
          >
            <p className="text-ui font-medium">{row.original.titleEn}</p>
            <p className="text-ui-meta text-muted-foreground font-mono">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: columnLabels.status,
        cell: ({ row }) => (
          <StatusPill status={STATUS_KEY[row.original.status]} labels={statusLabels} />
        ),
      },
      {
        id: 'tags',
        header: columnLabels.tags,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.tags.map((tag) => (
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
        accessorKey: 'readingMinutes',
        header: columnLabels.reading,
        cell: ({ row }) => (
          <span className="tabular-nums">{readingLabel(row.original.readingMinutes)}</span>
        ),
      },
      {
        id: 'publishedAt',
        accessorKey: 'publishedAt',
        header: columnLabels.published,
        cell: ({ row }) => (
          <span className="text-ui-meta text-muted-foreground tabular-nums">
            {row.original.publishedAt ? row.original.publishedAt.slice(0, 10) : '—'}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: columnLabels.updated,
        cell: ({ row }) => (
          <span className="text-ui-meta text-muted-foreground tabular-nums">
            {formatRelative(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: columnLabels.actions,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          canWrite ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
              {labels.shortcuts.edit}
            </Button>
          ) : null,
      },
    ],
    [canWrite, columnLabels, labels, onEdit, onPrefetch, readingLabel, statusLabels],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      rowId={(row) => String(row.id)}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      hasFilters={hasFilters}
      isError={isError}
      canWrite={canWrite}
      labels={labels}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      onOpen={onOpen}
      onEdit={onEdit}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={onCreate}
      onClearFilters={onClearFilters}
      onRetry={onRetry}
      renderCard={(row) => (
        <button
          type="button"
          className="bg-card w-full rounded-lg border p-3 text-left"
          onClick={() => onOpen(row)}
        >
          <p className="text-ui font-medium">{row.titleEn}</p>
          <p className="text-ui-meta text-muted-foreground">{row.slug}</p>
        </button>
      )}
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
