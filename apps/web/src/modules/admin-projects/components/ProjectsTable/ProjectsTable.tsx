'use client';

import type { AdminProjectListItem, Hue } from '@portfolio/contracts';
import { StatusPill } from '@portfolio/ui/components/StatusPill/StatusPill';
import { type AdminTableColumn } from '@portfolio/ui/components/AdminTable/AdminTable';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { BADGE_HUE } from '@portfolio/ui/utils/hue.util';

import {
  AdminListTable,
  type AdminListTableLabels,
} from '@/modules/admin-core/components/AdminListTable/AdminListTable';

const STATUS_KEY = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export function ProjectsTable({
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
  moveLabels,
  onSortChange,
  onPageChange,
  onDelete,
  onBulkDelete,
  onCreate,
  onClearFilters,
  onRetry,
  onPrefetch,
  onMove,
}: {
  label: string;
  items: AdminProjectListItem[];
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
    domain: string;
    keyFacts: string;
    status: string;
    updated: string;
    actions: string;
  };
  statusLabels: { draft: string; published: string; archived: string };
  moveLabels: { up: string; down: string };
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (row: AdminProjectListItem) => void;
  onBulkDelete: (rows: AdminProjectListItem[]) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
}) {
  const columns: AdminTableColumn<AdminProjectListItem>[] = [
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
      id: 'domain',
      header: columnLabels.domain,
      cell: (row) =>
        row.domain ? (
          <Badge hue={BADGE_HUE[row.domain.hue as Hue]} className="normal-case">
            {row.domain.nameEn}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'keyFactsCount',
      header: columnLabels.keyFacts,
      cell: (row) => <span className="tabular-nums">{String(row.keyFactsCount)}</span>,
    },
    {
      id: 'status',
      header: columnLabels.status,
      cell: (row) => <StatusPill status={STATUS_KEY[row.status]} labels={statusLabels} />,
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

  if (canWrite) {
    columns.push({
      id: 'actions',
      header: columnLabels.actions,
      interactive: true,
      cell: (row) => (
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => onMove(row.id, -1)}>
            {moveLabels.up}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onMove(row.id, 1)}>
            {moveLabels.down}
          </Button>
        </div>
      ),
    });
  }

  return (
    <AdminListTable
      label={label}
      columns={columns}
      items={items}
      rowId={(row) => String(row.id)}
      rowLabel={(row) => row.titleEn}
      rowHref={(row) => `/admin/projects/${row.id}`}
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
