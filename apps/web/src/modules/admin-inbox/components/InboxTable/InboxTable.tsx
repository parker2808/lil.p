'use client';

import type { AdminContactMessage, ContactMessageStatus } from '@portfolio/contracts';
import { DataTable, type DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

const STATUS_VARIANT = {
  NEW: 'primary',
  READ: 'neutral',
  REPLIED: 'success',
  SPAM: 'outline',
} as const;

export function InboxTable({
  items,
  total,
  page,
  pageSize,
  sort,
  hasFilters,
  isError,
  isLoading,
  isFetching,
  canWrite,
  labels,
  columnLabels,
  statusLabels,
  actionLabels,
  onSortChange,
  onPageChange,
  onOpen,
  onMarkRead,
  onMarkSpam,
  onClearFilters,
  onRetry,
}: {
  items: AdminContactMessage[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  hasFilters: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  canWrite: boolean;
  labels: DataTableLabels;
  columnLabels: { name: string; topic: string; status: string; created: string; actions: string };
  statusLabels: Record<ContactMessageStatus, string>;
  actionLabels: { read: string; spam: string };
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onOpen: (row: AdminContactMessage) => void;
  onMarkRead: (row: AdminContactMessage) => void;
  onMarkSpam: (row: AdminContactMessage) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  const columns = useMemo<ColumnDef<AdminContactMessage>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: columnLabels.name,
        cell: ({ row }) => row.original.name,
      },
      {
        id: 'topic',
        header: columnLabels.topic,
        enableSorting: false,
        cell: ({ row }) => row.original.topic?.labelEn ?? '',
      },
      {
        id: 'status',
        accessorKey: 'status',
        enableSorting: false,
        header: columnLabels.status,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: columnLabels.created,
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        id: 'actions',
        header: columnLabels.actions,
        enableSorting: false,
        cell: ({ row }) =>
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onMarkRead(row.original)}
              >
                {actionLabels.read}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onMarkSpam(row.original)}
              >
                {actionLabels.spam}
              </Button>
            </div>
          ) : null,
      },
    ],
    [actionLabels, canWrite, columnLabels, onMarkRead, onMarkSpam, statusLabels],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      hasFilters={hasFilters}
      isError={isError}
      isLoading={isLoading}
      isFetching={isFetching}
      canWrite={canWrite}
      labels={labels}
      rowId={(row) => String(row.id)}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      onOpen={onOpen}
      onClearFilters={onClearFilters}
      onRetry={onRetry}
    />
  );
}
