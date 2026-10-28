'use client';

import type { AdminUser } from '@portfolio/contracts';
import { DataTable, type DataTableLabels } from '@portfolio/ui/components/DataTable/DataTable';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export function UsersTable({
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
  onSortChange,
  onPageChange,
  onCreate,
  onEdit,
  onClearFilters,
  onRetry,
  onToggleActive,
  onSignOut,
  onSetPassword,
}: {
  items: AdminUser[];
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
  columnLabels: {
    name: string;
    email: string;
    role: string;
    active: string;
    lastLogin: string;
    actions: string;
    signOut: string;
    setPassword: string;
  };
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (row: AdminUser) => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onToggleActive: (row: AdminUser, isActive: boolean) => void;
  onSignOut: (row: AdminUser) => void;
  onSetPassword: (row: AdminUser) => void;
}) {
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: columnLabels.name,
        cell: ({ row }) => <p className="text-ui font-medium">{row.original.name}</p>,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: columnLabels.email,
        cell: ({ row }) => <p className="text-ui-meta font-mono">{row.original.email}</p>,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: columnLabels.role,
        enableSorting: false,
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: columnLabels.active,
        enableSorting: false,
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            disabled={!canWrite}
            aria-label={columnLabels.active}
            onCheckedChange={(checked) => onToggleActive(row.original, checked)}
          />
        ),
      },
      {
        id: 'lastLoginAt',
        accessorKey: 'lastLoginAt',
        header: columnLabels.lastLogin,
        cell: ({ row }) => (
          <span className="text-ui-meta text-muted-foreground tabular-nums">
            {row.original.lastLoginAt ? row.original.lastLoginAt.slice(0, 10) : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: columnLabels.actions,
        enableSorting: false,
        cell: ({ row }) =>
          canWrite ? (
            <div className="flex flex-wrap gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
                {labels.shortcuts.edit}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSignOut(row.original)}
              >
                {columnLabels.signOut}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSetPassword(row.original)}
              >
                {columnLabels.setPassword}
              </Button>
            </div>
          ) : null,
      },
    ],
    [
      canWrite,
      columnLabels,
      labels.shortcuts.edit,
      onEdit,
      onSetPassword,
      onSignOut,
      onToggleActive,
    ],
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
      isLoading={isLoading}
      isFetching={isFetching}
      canWrite={canWrite}
      labels={labels}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      onOpen={onEdit}
      onEdit={onEdit}
      onDelete={() => undefined}
      onBulkDelete={() => undefined}
      onCreate={onCreate}
      onClearFilters={onClearFilters}
      onRetry={onRetry}
      renderCard={(row) => (
        <button
          type="button"
          className="bg-card w-full rounded-lg border p-3 text-left"
          onClick={() => onEdit(row)}
        >
          <p className="text-ui font-medium">{row.name}</p>
          <p className="text-ui-meta text-muted-foreground font-mono">{row.email}</p>
        </button>
      )}
    />
  );
}
