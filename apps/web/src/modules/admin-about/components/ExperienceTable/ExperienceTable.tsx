'use client';

import type { AdminExperience } from '@portfolio/contracts';
import { type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { Button } from '@portfolio/ui/components/ui/button';
import { Switch } from '@portfolio/ui/components/ui/switch';

import {
  AdminListTable,
  type AdminListTableLabels,
} from '@/modules/admin-core/components/AdminListTable/AdminListTable';

export function ExperienceTable({
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
  formatDates,
  onSortChange,
  onPageChange,
  onDelete,
  onBulkDelete,
  onCreate,
  onClearFilters,
  onRetry,
  onPrefetch,
  onMove,
  onToggleVisible,
}: {
  label: string;
  items: AdminExperience[];
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
    company: string;
    role: string;
    dates: string;
    visible: string;
    actions: string;
  };
  formatDates: (start: string, end: string | null) => string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (row: AdminExperience) => void;
  onBulkDelete: (rows: AdminExperience[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onToggleVisible: (row: AdminExperience) => void;
}) {
  const columns: AdminTableColumn<AdminExperience>[] = [
    {
      id: 'company',
      header: columnLabels.company,
      sortable: true,
      cell: (row) => (
        <div onMouseEnter={() => onPrefetch(row.id)} onFocus={() => onPrefetch(row.id)}>
          <p className="text-ui font-medium">{row.company}</p>
          <p className="text-ui-meta text-muted-foreground">{row.location}</p>
        </div>
      ),
    },
    {
      id: 'roleEn',
      header: columnLabels.role,
      cell: (row) => <p className="text-ui">{row.roleEn}</p>,
    },
    {
      id: 'startDate',
      header: columnLabels.dates,
      sortable: true,
      cell: (row) => (
        <span className="text-ui-meta text-muted-foreground tabular-nums">
          {formatDates(row.startDate, row.endDate)}
        </span>
      ),
    },
    {
      id: 'isVisible',
      header: columnLabels.visible,
      interactive: true,
      cell: (row) => (
        <Switch
          checked={row.isVisible}
          disabled={!canWrite}
          aria-label={columnLabels.visible}
          onCheckedChange={() => onToggleVisible(row)}
        />
      ),
    },
    ...(canWrite
      ? [
          {
            id: 'actions',
            header: columnLabels.actions,
            interactive: true,
            cell: (row: AdminExperience) => (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => onMove(row.id, -1)}>
                  {labels.previous}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onMove(row.id, 1)}>
                  {labels.next}
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
      rowLabel={(row) => row.company}
      rowHref={(row) => `/admin/experience/${row.id}`}
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
