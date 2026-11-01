import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(cleanup);

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

  it('hides selection for read-only viewers', () => {
    renderTable({ canWrite: false });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
