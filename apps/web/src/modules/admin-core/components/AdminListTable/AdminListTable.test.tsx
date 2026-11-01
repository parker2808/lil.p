import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TABLE_DENSITY_STORAGE_KEY } from '../../hooks/use-table-density.hook';
import { AdminListTable, type AdminListTableLabels } from './AdminListTable';

type Row = { id: number; title: string };

const rows: Row[] = [
  { id: 1, title: 'Alpha' },
  { id: 2, title: 'Beta' },
];

const labels: AdminListTableLabels = {
  empty: 'Nothing yet',
  emptyAction: 'Create',
  noResults: 'No matches',
  clearFilters: 'Clear filters',
  error: 'Failed',
  retry: 'Retry',
  select: 'Select',
  selectAll: 'Select all rows',
  selected: '{count} selected',
  clearSelection: 'Clear selection',
  density: 'Density',
  densityCompact: 'Compact',
  densityComfortable: 'Comfortable',
  range: '{from}–{to} of {total}',
  previous: 'Previous',
  next: 'Next',
  confirmArchiveTitle: 'Archive these?',
  confirmArchive: 'They leave the site.',
  cancel: 'Cancel',
  archive: 'Archive',
};

function renderTable(overrides: { canWrite?: boolean } = {}) {
  const onDelete = vi.fn();
  const onBulkDelete = vi.fn();
  render(
    <AdminListTable<Row>
      label="Things"
      columns={[{ id: 'title', header: 'Title', cell: (row) => row.title }]}
      items={rows}
      rowId={(row) => String(row.id)}
      rowLabel={(row) => row.title}
      rowHref={(row) => `/admin/things/${row.id}`}
      total={2}
      page={1}
      pageSize={20}
      sort="-updatedAt"
      onSortChange={vi.fn()}
      onPageChange={vi.fn()}
      hasFilters={false}
      canWrite={overrides.canWrite ?? true}
      labels={labels}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      onCreate={vi.fn()}
      onClearFilters={vi.fn()}
      onRetry={vi.fn()}
    />,
  );
  return { onDelete, onBulkDelete };
}

describe('AdminListTable', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders each row as a real link with its href', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute('href', '/admin/things/1');
    expect(screen.getByRole('link', { name: 'Beta' })).toHaveAttribute('href', '/admin/things/2');
    expect(screen.getByText('1–2 of 2')).toBeInTheDocument();
  });

  it('archives one selected row only after confirmation', () => {
    const { onDelete, onBulkDelete } = renderTable();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
    expect(onBulkDelete).not.toHaveBeenCalled();
  });

  it('archives every row from select all through bulk archive', () => {
    const { onBulkDelete } = renderTable();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onBulkDelete).toHaveBeenCalledWith(rows);
  });

  it('clears the selection from the bulk action bar', () => {
    renderTable();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    const bar = screen.getByRole('group', { name: '2 selected' });
    fireEvent.click(within(bar).getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('group', { name: '2 selected' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select Alpha' })).not.toBeChecked();
  });

  it('switches to compact density and stores the choice locally', () => {
    renderTable();
    const table = document.querySelector('[data-slot="admin-table"]');
    expect(table).toHaveAttribute('data-density', 'comfortable');

    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(window.localStorage.getItem(TABLE_DENSITY_STORAGE_KEY)).toBe('compact');

    cleanup();
    renderTable();
    expect(document.querySelector('[data-slot="admin-table"]')).toHaveAttribute(
      'data-density',
      'compact',
    );
  });

  it('hides selection for read-only viewers', () => {
    renderTable({ canWrite: false });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders plain rows without selection when no href or delete is given', () => {
    render(
      <AdminListTable<Row>
        label="Things"
        columns={[{ id: 'title', header: 'Title', cell: (row) => row.title }]}
        items={rows}
        rowId={(row) => String(row.id)}
        rowLabel={(row) => row.title}
        total={2}
        page={1}
        pageSize={20}
        sort="-updatedAt"
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        hasFilters={false}
        canWrite
        labels={labels}
        onClearFilters={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
