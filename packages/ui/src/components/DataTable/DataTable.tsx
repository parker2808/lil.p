'use client';

import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@portfolio/ui/components/ui/alert-dialog';
import { Button } from '@portfolio/ui/components/ui/button';
import { Checkbox } from '@portfolio/ui/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@portfolio/ui/components/ui/table';
import { cn } from '@portfolio/ui/lib/utils';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from 'react';

export type DataTableDensity = 'default' | 'compact';

export type DataTableLabels = {
  empty: string;
  emptyAction: string;
  noResults: string;
  clearFilters: string;
  error: string;
  retry: string;
  selected: string;
  previous: string;
  next: string;
  range: string;
  columns: string;
  density: string;
  densityDefault: string;
  densityCompact: string;
  help: string;
  helpTitle: string;
  confirmDeleteTitle: string;
  confirmDelete: string;
  cancel: string;
  bulkDelete: string;
  shortcuts: {
    move: string;
    select: string;
    open: string;
    edit: string;
    remove: string;
    help: string;
    keys: {
      j: string;
      k: string;
      x: string;
      enter: string;
      e: string;
      backspace: string;
      help: string;
    };
  };
};

export function DataTable<TData>({
  columns,
  data,
  rowId,
  total,
  page,
  pageSize,
  sort,
  onSortChange,
  onPageChange,
  canWrite = false,
  onOpen,
  onEdit,
  onDelete,
  onBulkDelete,
  isLoading = false,
  isFetching = false,
  isError = false,
  hasFilters = false,
  onRetry,
  onCreate,
  onClearFilters,
  renderCard,
  labels,
  density = 'default',
  onDensityChange,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  rowId: (row: TData) => string;
  total: number;
  page: number;
  pageSize: number;
  sort?: string;
  onSortChange?: (sort: string) => void;
  onPageChange?: (page: number) => void;
  canWrite?: boolean;
  onOpen?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onBulkDelete?: (rows: TData[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  hasFilters?: boolean;
  onRetry?: () => void;
  onCreate?: () => void;
  onClearFilters?: () => void;
  renderCard?: (row: TData) => ReactNode;
  labels: DataTableLabels;
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
}) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TData[] | null>(null);
  const lastSelected = useRef<number | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const sorting = useMemo<SortingState>(() => {
    if (!sort) {
      return [];
    }
    return sort.startsWith('-') ? [{ id: sort.slice(1), desc: true }] : [{ id: sort, desc: false }];
  }, [sort]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, columnVisibility, sorting },
    getRowId: (row) => rowId(row),
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const first = next[0];
      if (!first || !onSortChange) {
        return;
      }
      onSortChange(first.desc ? `-${first.id}` : first.id);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const rowHeight = density === 'compact' ? 'h-8' : 'h-10';

  function selectRange(fromIndex: number, toIndex: number) {
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const next = { ...rowSelection };
    table
      .getRowModel()
      .rows.slice(start, end + 1)
      .forEach((row) => {
        next[row.id] = true;
      });
    setRowSelection(next);
  }

  function requestDelete(rows: TData[]) {
    if (!canWrite || rows.length === 0) {
      return;
    }
    setPendingDelete(rows);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const rows = table.getRowModel().rows;
    if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setHelpOpen(true);
      return;
    }
    if (rows.length === 0) {
      return;
    }
    const current = rows[Math.min(activeIndex, rows.length - 1)];
    if (!current) {
      return;
    }
    if (event.key === 'j') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(rows.length - 1, index + 1));
    }
    if (event.key === 'k') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === 'x') {
      event.preventDefault();
      current.toggleSelected();
      lastSelected.current = activeIndex;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onOpen?.(current.original);
    }
    if (event.key === 'e' && canWrite) {
      event.preventDefault();
      onEdit?.(current.original);
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && canWrite) {
      event.preventDefault();
      requestDelete(selectedRows.length > 0 ? selectedRows : [current.original]);
    }
  }

  if (isError) {
    return <ErrorState message={labels.error} retryLabel={labels.retry} onRetry={onRetry} />;
  }

  if (!isLoading && total === 0 && !hasFilters) {
    return (
      <div className="flex flex-col items-start gap-3 py-10">
        <p className="text-ui text-muted-foreground">{labels.empty}</p>
        {onCreate ? (
          <Button type="button" size="sm" onClick={onCreate}>
            {labels.emptyAction}
          </Button>
        ) : null}
      </div>
    );
  }

  if (!isLoading && total === 0 && hasFilters) {
    return (
      <div className="flex flex-col items-start gap-3 py-10">
        <p className="text-ui text-muted-foreground">{labels.noResults}</p>
        {onClearFilters ? (
          <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
            {labels.clearFilters}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      data-slot="data-table"
      data-density={density}
      aria-busy={isLoading || isFetching}
      data-fetching={isFetching || undefined}
      className="outline-none"
      onKeyDown={onKeyDown}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-ui-meta text-muted-foreground">
          {labels.range
            .replace('{from}', String(from))
            .replace('{to}', String(to))
            .replace('{total}', String(total))}
        </p>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {labels.columns}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllLeafColumns().map((column) =>
                column.getCanHide() ? (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                  >
                    {column.columnDef.header?.toString() ?? column.id}
                  </DropdownMenuCheckboxItem>
                ) : null,
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {onDensityChange ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDensityChange(density === 'default' ? 'compact' : 'default')}
            >
              {density === 'default' ? labels.densityCompact : labels.densityDefault}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
            {labels.help}
          </Button>
        </div>
      </div>

      {canWrite && selectedRows.length > 0 ? (
        <div className="bg-muted mb-3 flex items-center justify-between rounded-md px-3 py-2">
          <p className="text-ui">
            {labels.selected.replace('{count}', String(selectedRows.length))}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => requestDelete(selectedRows)}
          >
            {labels.bulkDelete}
          </Button>
        </div>
      ) : null}

      <div className={cn('overflow-x-auto', renderCard && 'hidden sm:block')}>
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                <TableHead className="w-10">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
                    aria-label={labels.selected.replace('{count}', String(data.length))}
                  />
                </TableHead>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="relative"
                    style={{ width: header.getSize() }}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="text-ui-meta inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </button>
                    )}
                    {header.column.getCanResize() ? (
                      <i
                        aria-hidden
                        className="bg-border absolute top-0 right-0 h-full w-1 cursor-col-resize"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="size-4" />
                    </TableCell>
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell key={column.id} style={{ width: column.getSize() }}>
                        <Skeleton className="h-5 w-4/5" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-selected={row.getIsSelected() || index === activeIndex}
                    className={cn(rowHeight, index === activeIndex && 'bg-sidebar-accent')}
                    onClick={() => setActiveIndex(index)}
                    onDoubleClick={() => onOpen?.(row.original)}
                  >
                    <TableCell className="w-10">
                      <Checkbox
                        checked={row.getIsSelected()}
                        aria-label={`${labels.shortcuts.select}: ${rowId(row.original)}`}
                        onCheckedChange={(value) => {
                          if (typeof window !== 'undefined' && lastSelected.current !== null) {
                            const event = window.event as MouseEvent | undefined;
                            if (event?.shiftKey) {
                              selectRange(lastSelected.current, index);
                              lastSelected.current = index;
                              return;
                            }
                          }
                          row.toggleSelected(Boolean(value));
                          lastSelected.current = index;
                        }}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {renderCard ? (
        <ul className="flex flex-col gap-3 sm:hidden">
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-20 w-full" />
                </li>
              ))
            : null}
          {(isLoading ? [] : data).map((row) => (
            <li key={rowId(row)}>{renderCard(row)}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          {labels.previous}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange?.(page + 1)}
        >
          {labels.next}
        </Button>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) {
                  return;
                }
                if (pendingDelete.length > 1) {
                  onBulkDelete?.(pendingDelete);
                } else if (pendingDelete[0]) {
                  onDelete?.(pendingDelete[0]);
                }
                setPendingDelete(null);
                setRowSelection({});
              }}
            >
              {labels.bulkDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogTitle>{labels.helpTitle}</DialogTitle>
          <ul className="mt-3 flex flex-col gap-2">
            <li className="text-ui flex justify-between gap-4">
              <span>{labels.shortcuts.move}</span>
              <span>
                <Kbd>{labels.shortcuts.keys.j}</Kbd> <Kbd>{labels.shortcuts.keys.k}</Kbd>
              </span>
            </li>
            <li className="text-ui flex justify-between gap-4">
              <span>{labels.shortcuts.select}</span>
              <Kbd>{labels.shortcuts.keys.x}</Kbd>
            </li>
            <li className="text-ui flex justify-between gap-4">
              <span>{labels.shortcuts.open}</span>
              <Kbd>{labels.shortcuts.keys.enter}</Kbd>
            </li>
            {canWrite ? (
              <>
                <li className="text-ui flex justify-between gap-4">
                  <span>{labels.shortcuts.edit}</span>
                  <Kbd>{labels.shortcuts.keys.e}</Kbd>
                </li>
                <li className="text-ui flex justify-between gap-4">
                  <span>{labels.shortcuts.remove}</span>
                  <Kbd>{labels.shortcuts.keys.backspace}</Kbd>
                </li>
              </>
            ) : null}
            <li className="text-ui flex justify-between gap-4">
              <span>{labels.shortcuts.help}</span>
              <Kbd>{labels.shortcuts.keys.help}</Kbd>
            </li>
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
