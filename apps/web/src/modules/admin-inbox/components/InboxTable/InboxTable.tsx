'use client';

import type { AdminContactMessage, ContactMessageStatus } from '@portfolio/contracts';
import { type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';

import {
  AdminListTable,
  type AdminListTableLabels,
} from '@/modules/admin-core/components/AdminListTable/AdminListTable';

const STATUS_VARIANT = {
  NEW: 'primary',
  READ: 'neutral',
  REPLIED: 'success',
  SPAM: 'outline',
} as const;

export function InboxTable({
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
  actionLabels,
  onSortChange,
  onPageChange,
  onMarkRead,
  onMarkSpam,
  onClearFilters,
  onRetry,
}: {
  label: string;
  items: AdminContactMessage[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  hasFilters: boolean;
  isError?: boolean;
  isLoading?: boolean;
  canWrite: boolean;
  labels: AdminListTableLabels;
  columnLabels: { name: string; topic: string; status: string; created: string; actions: string };
  statusLabels: Record<ContactMessageStatus, string>;
  actionLabels: { read: string; spam: string };
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onMarkRead: (row: AdminContactMessage) => void;
  onMarkSpam: (row: AdminContactMessage) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  const columns: AdminTableColumn<AdminContactMessage>[] = [
    {
      id: 'name',
      header: columnLabels.name,
      cell: (row) => row.name,
    },
    {
      id: 'topic',
      header: columnLabels.topic,
      cell: (row) => row.topic?.labelEn ?? '',
    },
    {
      id: 'status',
      header: columnLabels.status,
      cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{statusLabels[row.status]}</Badge>,
    },
    {
      id: 'createdAt',
      header: columnLabels.created,
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    ...(canWrite
      ? [
          {
            id: 'actions',
            header: columnLabels.actions,
            interactive: true,
            cell: (row: AdminContactMessage) => (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => onMarkRead(row)}>
                  {actionLabels.read}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => onMarkSpam(row)}>
                  {actionLabels.spam}
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <AdminListTable
      label={label}
      columns={columns}
      items={items}
      rowId={(row) => String(row.id)}
      rowLabel={(row) => row.name}
      rowHref={(row) => `/admin/inbox/${row.id}`}
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
      onClearFilters={onClearFilters}
      onRetry={onRetry}
    />
  );
}
