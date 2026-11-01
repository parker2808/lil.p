import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ADMIN_TABLE_SEARCH_DEBOUNCE_MS,
  AdminTable,
  type AdminTableColumn,
  type AdminTableLinkProps,
} from './AdminTable';

type Row = { id: string; title: string; status: string };

const ROWS: Row[] = [
  { id: 'p1', title: 'Sample case', status: 'Draft' },
  { id: 'p2', title: 'Second case', status: 'Published' },
];

const COLUMNS: AdminTableColumn<Row>[] = [
  { id: 'title', header: 'Title', cell: (row) => row.title, sortable: true },
  { id: 'status', header: 'Status', cell: (row) => row.status },
];

function renderTable(props: Partial<Parameters<typeof AdminTable<Row>>[0]> = {}) {
  return render(
    <AdminTable<Row>
      label="Projects"
      columns={COLUMNS}
      data={ROWS}
      rowId={(row) => row.id}
      empty={<p>No projects yet.</p>}
      error={<p>Could not load projects.</p>}
      {...props}
    />,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('AdminTable', () => {
  it('debounces search by 300ms and sends only the last value', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    renderTable({ search: { label: 'Search projects', onSearch } });

    const input = screen.getByRole('searchbox', { name: 'Search projects' });
    fireEvent.change(input, { target: { value: 'sa' } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: 'sample' } });
    act(() => vi.advanceTimersByTime(ADMIN_TABLE_SEARCH_DEBOUNCE_MS - 1));
    expect(onSearch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('sample');
  });

  it('does not search on mount and keeps the default value', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    renderTable({ search: { label: 'Search projects', defaultValue: 'case', onSearch } });

    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveValue('case');
    act(() => vi.advanceTimersByTime(ADMIN_TABLE_SEARCH_DEBOUNCE_MS * 2));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('renders each row as a real anchor to rowHref', () => {
    renderTable({ rowHref: (row) => `/admin/projects/${row.id}` });

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/admin/projects/p1');
    expect(links[0]).toHaveTextContent('Sample case');
    expect(links[1]).toHaveAttribute('href', '/admin/projects/p2');

    const firstRow = screen.getAllByRole('row')[1]!;
    const anchors = firstRow.querySelectorAll('a[href="/admin/projects/p1"]');
    expect(anchors).toHaveLength(2);
    expect(anchors[1]).toHaveAttribute('tabindex', '-1');
    expect(anchors[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders rows through the provided link component and skips interactive cells', () => {
    function TestLink({ children, ...props }: AdminTableLinkProps) {
      return (
        <a data-testid="router-link" {...props}>
          {children}
        </a>
      );
    }
    renderTable({
      rowHref: (row) => `/admin/projects/${row.id}`,
      linkComponent: TestLink,
      columns: [
        ...COLUMNS,
        {
          id: 'actions',
          header: 'Actions',
          interactive: true,
          cell: (row) => <button type="button">Archive {row.title}</button>,
        },
      ],
    });

    expect(screen.getAllByTestId('router-link')).toHaveLength(4);
    const archive = screen.getByRole('button', { name: 'Archive Sample case' });
    expect(archive.closest('a')).toBeNull();
  });

  it('renders plain cells without rowHref', () => {
    renderTable();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Sample case' })).toBeInTheDocument();
  });

  it('toggles sort on sortable headers and marks aria-sort', async () => {
    const onSortChange = vi.fn();
    const { rerender } = renderTable({ onSortChange });

    expect(screen.queryByRole('button', { name: /Status/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Title/ }));
    expect(onSortChange).toHaveBeenLastCalledWith('title');

    rerender(
      <AdminTable<Row>
        label="Projects"
        columns={COLUMNS}
        data={ROWS}
        rowId={(row) => row.id}
        sort="title"
        onSortChange={onSortChange}
        empty={null}
        error={null}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /Title/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(screen.getByRole('button', { name: /Title/ }));
    expect(onSortChange).toHaveBeenLastCalledWith('-title');
  });

  it('shows the empty slot when there are no rows', () => {
    renderTable({ data: [] });
    const table = screen.getByRole('table', { name: 'Projects' });
    expect(within(table).getByText('No projects yet.')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
  });

  it('shows the loading slot, or skeleton rows by default', () => {
    const { rerender } = renderTable({ isLoading: true, loading: <p>Loading projects</p> });
    expect(screen.getByText('Loading projects')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Sample case')).not.toBeInTheDocument();

    rerender(
      <AdminTable<Row>
        label="Projects"
        columns={COLUMNS}
        data={ROWS}
        rowId={(row) => row.id}
        isLoading
        empty={null}
        error={null}
      />,
    );
    expect(document.querySelectorAll('tr[data-state="loading"]')).toHaveLength(5);
  });

  it('shows the error slot over data and loading', () => {
    renderTable({ isError: true, isLoading: true });
    expect(screen.getByText('Could not load projects.')).toBeInTheDocument();
    expect(screen.queryByText('Sample case')).not.toBeInTheDocument();
    expect(screen.queryByText('No projects yet.')).not.toBeInTheDocument();
  });
});
