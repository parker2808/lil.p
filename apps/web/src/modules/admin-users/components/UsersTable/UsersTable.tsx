'use client';

import type { AdminUser } from '@portfolio/contracts';
import { type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { formatDateTime } from '@portfolio/ui/components/AuditRow/relative-time.util';
import { useLocale } from 'next-intl';

import {
  AdminListTable,
  type AdminListTableLabels,
} from '@/modules/admin-core/components/AdminListTable/AdminListTable';

export function UsersTable({
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
  label: string;
  items: AdminUser[];
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
    name: string;
    email: string;
    role: string;
    active: string;
    lastLogin: string;
    actions: string;
    edit: string;
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
  const locale = useLocale();
  const columns: AdminTableColumn<AdminUser>[] = [
    {
      id: 'name',
      header: columnLabels.name,
      sortable: true,
      cell: (row) => <p className="text-ui font-medium">{row.name}</p>,
    },
    {
      id: 'email',
      header: columnLabels.email,
      sortable: true,
      cell: (row) => <p className="text-ui-meta font-mono">{row.email}</p>,
    },
    {
      id: 'role',
      header: columnLabels.role,
      cell: (row) => <Badge variant="outline">{row.role}</Badge>,
    },
    {
      id: 'isActive',
      header: columnLabels.active,
      cell: (row) => (
        <Switch
          checked={row.isActive}
          disabled={!canWrite}
          aria-label={columnLabels.active}
          onCheckedChange={(checked) => onToggleActive(row, checked)}
        />
      ),
    },
    {
      id: 'lastLoginAt',
      header: columnLabels.lastLogin,
      sortable: true,
      cell: (row) => (
        <span className="text-ui-meta text-muted-foreground tabular-nums">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt, locale) : '—'}
        </span>
      ),
    },
    ...(canWrite
      ? [
          {
            id: 'actions',
            header: columnLabels.actions,
            cell: (row: AdminUser) => (
              <div className="flex flex-wrap gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(row)}>
                  {columnLabels.edit}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onSignOut(row)}>
                  {columnLabels.signOut}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onSetPassword(row)}>
                  {columnLabels.setPassword}
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
      onCreate={onCreate}
      onClearFilters={onClearFilters}
      onRetry={onRetry}
    />
  );
}
