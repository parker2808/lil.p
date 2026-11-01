import type { AdminExperience } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  select: 'Select',
  selectAll: 'Select all rows',
  selected: '{count} selected',
  range: '{from}–{to} of {total}',
  previous: 'Previous',
  next: 'Next',
  confirmArchiveTitle: 'Delete?',
  confirmArchive: 'Gone',
  cancel: 'Cancel',
  archive: 'Delete',
};

function renderTable() {
  const onToggleVisible = vi.fn();
  const onDelete = vi.fn();
  render(
    <ExperienceTable
      label="Experience"
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
      onDelete={onDelete}
      onBulkDelete={vi.fn()}
      onCreate={vi.fn()}
      onClearFilters={vi.fn()}
      onRetry={vi.fn()}
      onPrefetch={vi.fn()}
      onMove={vi.fn()}
      onToggleVisible={onToggleVisible}
    />,
  );
  return { onToggleVisible, onDelete };
}

describe('ExperienceTable', () => {
  afterEach(cleanup);

  it('renders the role as a link to its editor', () => {
    renderTable();
    expect(screen.getByRole('link', { name: /Acme/ })).toHaveAttribute(
      'href',
      '/admin/pages/about/experience/4',
    );
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('toggles visibility outside the row link', async () => {
    const { onToggleVisible } = renderTable();
    const toggle = screen.getByRole('switch', { name: 'Visible' });
    expect(toggle).toBeChecked();
    expect(toggle.closest('a')).toBeNull();
    await userEvent.click(toggle);
    expect(onToggleVisible).toHaveBeenCalledWith(item);
  });

  it('deletes a selected role only after confirmation', async () => {
    const { onDelete } = renderTable();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(item);
  });
});
