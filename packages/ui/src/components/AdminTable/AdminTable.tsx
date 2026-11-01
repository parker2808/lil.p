'use client';

import { Input } from '@portfolio/ui/components/ui/input';
import { Label } from '@portfolio/ui/components/ui/label';
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
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentType,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

export const ADMIN_TABLE_SEARCH_DEBOUNCE_MS = 300;

export type AdminTableColumn<TData> = {
  id: string;
  header: ReactNode;
  cell: (row: TData) => ReactNode;
  sortable?: boolean;
  className?: string;
  /** Cell holds its own controls, so it is left outside the row link. */
  interactive?: boolean;
};

export type AdminTableLinkProps = {
  href: string;
  className?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
  children?: ReactNode;
};

export type AdminTableSearch = {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onSearch: (query: string) => void;
};

export function AdminTable<TData>({
  label,
  columns,
  data,
  rowId,
  rowHref,
  linkComponent: LinkComponent = 'a',
  sort,
  onSortChange,
  search,
  isLoading = false,
  isError = false,
  empty,
  loading,
  error,
  className,
}: {
  label: string;
  columns: AdminTableColumn<TData>[];
  data: TData[];
  rowId: (row: TData) => string;
  rowHref?: (row: TData) => string | undefined;
  linkComponent?: ComponentType<AdminTableLinkProps> | 'a';
  sort?: string;
  onSortChange?: (sort: string) => void;
  search?: AdminTableSearch;
  isLoading?: boolean;
  isError?: boolean;
  empty: ReactNode;
  loading?: ReactNode;
  error: ReactNode;
  className?: string;
}) {
  const sortId = sort?.replace(/^-/, '');
  const sortDesc = sort?.startsWith('-') ?? false;

  function statusRow(state: string, content: ReactNode) {
    return (
      <TableRow data-state={state}>
        <TableCell colSpan={columns.length} className="admin-table-status">
          {content}
        </TableCell>
      </TableRow>
    );
  }

  function renderBody() {
    if (isError) {
      return statusRow('error', error);
    }
    if (isLoading) {
      if (loading) {
        return statusRow('loading', loading);
      }
      return Array.from({ length: 5 }, (_, index) => (
        <TableRow key={`skeleton-${index}`} data-state="loading">
          {columns.map((column) => (
            <TableCell key={column.id}>
              <Skeleton className="h-5 w-4/5" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }
    if (data.length === 0) {
      return statusRow('empty', empty);
    }
    return data.map((row) => {
      const href = rowHref?.(row);
      let linked = 0;
      return (
        <TableRow key={rowId(row)} data-href={href}>
          {columns.map((column) => {
            const content = column.cell(row);
            if (!href || column.interactive) {
              return (
                <TableCell key={column.id} className={column.className}>
                  {content}
                </TableCell>
              );
            }
            const primary = linked === 0;
            linked += 1;
            return (
              <TableCell key={column.id} className={column.className} data-linked="">
                <LinkComponent
                  href={href}
                  className="admin-table-link"
                  tabIndex={primary ? undefined : -1}
                  aria-hidden={primary ? undefined : true}
                >
                  {content}
                </LinkComponent>
              </TableCell>
            );
          })}
        </TableRow>
      );
    });
  }

  return (
    <div data-slot="admin-table" className={cn('flex flex-col gap-3', className)}>
      {search ? <AdminTableSearchField {...search} /> : null}
      <div className="admin-table-viewport">
        <Table aria-label={label} aria-busy={isLoading || undefined}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const sorted = sortId === column.id ? (sortDesc ? 'desc' : 'asc') : undefined;
                const canSort = column.sortable && onSortChange;
                return (
                  <TableHead
                    key={column.id}
                    className={column.className}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="admin-table-sort"
                        onClick={() => onSortChange(sorted === 'asc' ? `-${column.id}` : column.id)}
                      >
                        {column.header}
                        {sorted === 'asc' ? (
                          <ArrowUp aria-hidden className="size-3" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown aria-hidden className="size-3" />
                        ) : (
                          <ArrowUpDown aria-hidden className="size-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>{renderBody()}</TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminTableSearchField({
  label,
  placeholder,
  defaultValue = '',
  onSearch,
}: AdminTableSearch) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next), ADMIN_TABLE_SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="flex max-w-sm flex-col gap-1.5">
      <Label htmlFor={id} className="text-ui-meta text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={onChange}
      />
    </div>
  );
}
