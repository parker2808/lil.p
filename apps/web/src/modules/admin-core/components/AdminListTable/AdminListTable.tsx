'use client';

import { AdminTable, type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Button } from '@portfolio/ui/components/ui/button';
import { Checkbox } from '@portfolio/ui/components/ui/checkbox';
import { ConfirmDialog } from '@portfolio/ui/components/ui/confirm-dialog';
import Link from 'next/link';
import { useState } from 'react';

export type AdminListTableLabels = {
  empty: string;
  emptyAction: string;
  noResults: string;
  clearFilters: string;
  error: string;
  retry: string;
  select: string;
  selectAll: string;
  selected: string;
  range: string;
  previous: string;
  next: string;
  confirmArchiveTitle: string;
  confirmArchive: string;
  cancel: string;
  archive: string;
};

export function AdminListTable<TData>({
  label,
  columns,
  items,
  rowId,
  rowLabel,
  rowHref,
  total,
  page,
  pageSize,
  sort,
  onSortChange,
  onPageChange,
  hasFilters,
  isLoading,
  isError,
  canWrite,
  labels,
  onDelete,
  onBulkDelete,
  onCreate,
  onClearFilters,
  onRetry,
}: {
  label: string;
  columns: AdminTableColumn<TData>[];
  items: TData[];
  rowId: (row: TData) => string;
  rowLabel: (row: TData) => string;
  rowHref: (row: TData) => string;
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  hasFilters: boolean;
  isLoading?: boolean;
  isError?: boolean;
  canWrite: boolean;
  labels: AdminListTableLabels;
  onDelete: (row: TData) => void;
  onBulkDelete: (rows: TData[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<TData[] | null>(null);

  const selectedRows = items.filter((row) => selectedIds.has(rowId(row)));
  const allSelected = items.length > 0 && selectedRows.length === items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  function toggle(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const selectColumn: AdminTableColumn<TData> = {
    id: 'select',
    className: 'w-10',
    interactive: true,
    header: (
      <Checkbox
        checked={allSelected ? true : selectedRows.length > 0 ? 'indeterminate' : false}
        onCheckedChange={(value) =>
          setSelectedIds(value === true ? new Set(items.map(rowId)) : new Set())
        }
        aria-label={labels.selectAll}
      />
    ),
    cell: (row) => (
      <Checkbox
        checked={selectedIds.has(rowId(row))}
        onCheckedChange={(value) => toggle(rowId(row), value === true)}
        aria-label={`${labels.select} ${rowLabel(row)}`}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-ui-meta text-muted-foreground">
          {labels.range
            .replace('{from}', String(from))
            .replace('{to}', String(to))
            .replace('{total}', String(total))}
        </p>
        {canWrite && selectedRows.length > 0 ? (
          <div className="flex items-center gap-2">
            <p className="text-ui">
              {labels.selected.replace('{count}', String(selectedRows.length))}
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setPendingDelete(selectedRows)}
            >
              {labels.archive}
            </Button>
          </div>
        ) : null}
      </div>

      <AdminTable
        label={label}
        columns={canWrite ? [selectColumn, ...columns] : columns}
        data={items}
        rowId={rowId}
        rowHref={rowHref}
        linkComponent={Link}
        sort={sort}
        onSortChange={onSortChange}
        isLoading={isLoading}
        isError={isError}
        error={<ErrorState message={labels.error} retryLabel={labels.retry} onRetry={onRetry} />}
        empty={
          <div className="flex flex-col items-start gap-3">
            <p className="text-ui text-muted-foreground">
              {hasFilters ? labels.noResults : labels.empty}
            </p>
            {hasFilters ? (
              <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
                {labels.clearFilters}
              </Button>
            ) : canWrite ? (
              <Button type="button" size="sm" onClick={onCreate}>
                {labels.emptyAction}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {labels.previous}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          {labels.next}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={labels.confirmArchiveTitle}
        description={labels.confirmArchive}
        cancelLabel={labels.cancel}
        confirmLabel={labels.archive}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.length > 1) onBulkDelete(pendingDelete);
          else if (pendingDelete[0]) onDelete(pendingDelete[0]);
          setPendingDelete(null);
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
