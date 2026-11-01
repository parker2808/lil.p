import type { AdminUser } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { UsersTable } from './UsersTable';

const item: AdminUser = {
  id: 3,
  name: 'Ana',
  email: '<email>',
  role: 'admin',
  isActive: true,
  lastLoginAt: '2026-10-26T00:00:00.000Z',
  updatedAt: '2026-10-26T00:00:00.000Z',
};

const labels = {
  empty: 'No users',
  emptyAction: 'New user',
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

describe('UsersTable', () => {
  it('edits a user from the actions column without row links or selection', async () => {
    const onEdit = vi.fn();
    render(
      <NextIntlClientProvider locale="vi">
        <UsersTable
          label="Users"
          items={[item]}
          total={1}
          page={1}
          pageSize={20}
          sort="name"
          hasFilters={false}
          canWrite
          labels={labels}
          columnLabels={{
            name: 'Name',
            email: 'Email',
            role: 'Role',
            active: 'Active',
            lastLogin: 'Last login',
            actions: 'Actions',
            edit: 'Edit',
            signOut: 'Sign out',
            setPassword: 'Set password',
          }}
          onSortChange={vi.fn()}
          onPageChange={vi.fn()}
          onCreate={vi.fn()}
          onEdit={onEdit}
          onClearFilters={vi.fn()}
          onRetry={vi.fn()}
          onToggleActive={vi.fn()}
          onSignOut={vi.fn()}
          onSetPassword={vi.fn()}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('table', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText(/26 thg 10, 2026/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(item);
  });
});
