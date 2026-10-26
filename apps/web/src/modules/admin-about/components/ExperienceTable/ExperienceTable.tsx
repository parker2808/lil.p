'use client';

import type { AdminExperience } from '@portfolio/contracts';
import { DataTable, type DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';
import { Button } from '@portfolio/ui/components/ui/button';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export function ExperienceTable({
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
  formatDates,
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
  onMove,
  onToggleVisible,
}: {
  items: AdminExperience[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  hasFilters: boolean;
  isError?: boolean;
  canWrite: boolean;
  labels: DataTableLabels;
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
  onOpen: (row: AdminExperience) => void;
  onEdit: (row: AdminExperience) => void;
  onDelete: (row: AdminExperience) => void;
  onBulkDelete: (rows: AdminExperience[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onToggleVisible: (row: AdminExperience) => void;
}) {
  const columns = useMemo<ColumnDef<AdminExperience>[]>(
    () => [
      {
        id: 'company',
        accessorKey: 'company',
        header: columnLabels.company,
        cell: ({ row }) => (
          <div
            onMouseEnter={() => onPrefetch(row.original.id)}
            onFocus={() => onPrefetch(row.original.id)}
          >
            <p className="text-ui font-medium">{row.original.company}</p>
            <p className="text-ui-meta text-muted-foreground">{row.original.location}</p>
          </div>
        ),
      },
      {
        id: 'roleEn',
        accessorKey: 'roleEn',
        header: columnLabels.role,
        cell: ({ row }) => <p className="text-ui">{row.original.roleEn}</p>,
      },
      {
        id: 'startDate',
        accessorKey: 'startDate',
        header: columnLabels.dates,
        cell: ({ row }) => (
          <span className="text-ui-meta text-muted-foreground tabular-nums">
            {formatDates(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        id: 'isVisible',
        accessorKey: 'isVisible',
        header: columnLabels.visible,
        cell: ({ row }) => (
          <Switch
            checked={row.original.isVisible}
            disabled={!canWrite}
            aria-label={columnLabels.visible}
            onCheckedChange={() => onToggleVisible(row.original)}
          />
        ),
      },
      {
        id: 'actions',
        header: columnLabels.actions,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          canWrite ? (
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
                {labels.shortcuts.edit}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMove(row.original.id, -1)}
              >
                {labels.previous}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMove(row.original.id, 1)}
              >
                {labels.next}
              </Button>
            </div>
          ) : null,
      },
    ],
    [canWrite, columnLabels, formatDates, labels, onEdit, onMove, onPrefetch, onToggleVisible],
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
        <div className="bg-card flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left">
          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(row)}>
            <p className="text-ui font-medium">{row.company}</p>
            <p className="text-ui-meta text-muted-foreground">{row.roleEn}</p>
          </button>
          {canWrite ? (
            <Switch
              checked={row.isVisible}
              aria-label={columnLabels.visible}
              onCheckedChange={() => onToggleVisible(row)}
            />
          ) : null}
        </div>
      )}
    />
  );
}
