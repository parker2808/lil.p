import type { AdminExperience } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExperienceTable } from './ExperienceTable';

const item: AdminExperience = {
  id: 4,
  company: 'Acme',
  companyUrl: null,
  location: 'Remote',
  employmentType: 'FULL_TIME',
  roleEn: 'Frontend',
  roleVi: '',
  summaryEn: '',
  summaryVi: '',
  highlightsEn: '',
  highlightsVi: '',
  startDate: '2024-01-01',
  endDate: null,
  sortOrder: 0,
  isVisible: true,
  skillIds: [],
  updatedAt: '2026-10-26T00:00:00.000Z',
};

const labels = {
  empty: 'No roles',
  emptyAction: 'New',
  noResults: 'None',
  clearFilters: 'Clear',
  error: 'Error',
  retry: 'Retry',
  selected: '{count} selected',
  previous: 'Previous',
  next: 'Next',
  range: '{from}–{to} of {total}',
  columns: 'Columns',
  density: 'Density',
  densityDefault: 'Default',
  densityCompact: 'Compact',
  help: 'Help',
  helpTitle: 'Shortcuts',
  confirmDeleteTitle: 'Delete?',
  confirmDelete: 'Gone',
  cancel: 'Cancel',
  bulkDelete: 'Delete',
  shortcuts: {
    move: 'Move',
    select: 'Select',
    open: 'Open',
    edit: 'Edit',
    remove: 'Remove',
    help: 'Help',
    keys: {
      j: 'j',
      k: 'k',
      x: 'x',
      enter: 'Enter',
      e: 'e',
      backspace: '⌫',
      help: '?',
    },
  },
};

describe('ExperienceTable', () => {
  it('renders the visibility switch for a role', () => {
    render(
      <ExperienceTable
        items={[item]}
        total={1}
        page={1}
        pageSize={20}
        sort="-startDate"
        hasFilters={false}
        canWrite
        labels={labels}
        columnLabels={{
          company: 'Company',
          role: 'Role',
          dates: 'Dates',
          visible: 'Visible',
          actions: 'Actions',
        }}
        formatDates={(start, end) => `${start}—${end ?? 'now'}`}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBulkDelete={vi.fn()}
        onCreate={vi.fn()}
        onClearFilters={vi.fn()}
        onRetry={vi.fn()}
        onPrefetch={vi.fn()}
        onMove={vi.fn()}
        onToggleVisible={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('switch', { name: 'Visible' })[0]).toBeChecked();
    expect(screen.getAllByText('Acme')[0]).toBeInTheDocument();
  });
});
