import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable, type DataTableLabels } from './DataTable';

const LABELS: DataTableLabels = {
  empty: 'No projects yet.',
  emptyAction: 'New project',
  noResults: 'No matching projects.',
  clearFilters: 'Clear filters',
  error: 'Could not load projects.',
  retry: 'Retry',
  selected: '{count} selected',
  previous: 'Previous',
  next: 'Next',
  range: '{from}–{to} of {total}',
  columns: 'Columns',
  density: 'Density',
  densityDefault: 'Default',
  densityCompact: 'Compact',
  help: 'Shortcuts',
  helpTitle: 'Keyboard shortcuts',
  confirmDeleteTitle: 'Archive these rows?',
  confirmDelete: 'Archived rows leave the public site.',
  cancel: 'Cancel',
  bulkDelete: 'Archive',
  shortcuts: {
    move: 'Move',
    select: 'Select',
    open: 'Open',
    edit: 'Edit',
    remove: 'Archive',
    help: 'Help',
    keys: { j: 'j', k: 'k', x: 'x', enter: 'Enter', e: 'e', backspace: '⌫', help: '?' },
  },
};

describe('DataTable', () => {
  it('shows an empty create action', async () => {
    const onCreate = vi.fn();
    render(
      <DataTable
        columns={[{ accessorKey: 'title', header: 'Title' }]}
        data={[]}
        rowId={() => '1'}
        total={0}
        page={1}
        pageSize={20}
        labels={LABELS}
        onCreate={onCreate}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'New project' }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('lists shortcuts in the help dialog', async () => {
    render(
      <DataTable
        columns={[{ accessorKey: 'title', header: 'Title' }]}
        data={[{ title: 'Sample case' }]}
        rowId={() => '11'}
        total={1}
        page={1}
        pageSize={20}
        canWrite
        labels={LABELS}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Shortcuts' }));
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Move')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });
});
