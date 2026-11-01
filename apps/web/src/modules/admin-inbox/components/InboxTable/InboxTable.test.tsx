import type { AdminContactMessage } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InboxTable } from './InboxTable';

const item: AdminContactMessage = {
  id: 9,
  name: 'Ana',
  email: '<email>',
  topicId: null,
  topic: null,
  message: 'Hello',
  locale: 'en',
  status: 'NEW',
  createdAt: '2026-10-26T12:00:00.000Z',
  updatedAt: '2026-10-26T12:00:00.000Z',
};

const labels = {
  empty: 'empty',
  emptyAction: 'empty action',
  noResults: 'no results',
  clearFilters: 'clear',
  error: 'error',
  retry: 'Retry',
  select: 'Select',
  selectAll: 'Select all rows',
  selected: '{count} selected',
  range: '{from}–{to} of {total}',
  previous: 'Previous',
  next: 'Next',
  confirmArchiveTitle: 'spam?',
  confirmArchive: 'spam',
  cancel: 'Cancel',
  archive: 'Mark spam',
};

function renderTable() {
  const onMarkRead = vi.fn();
  render(
    <InboxTable
      label="Inbox"
      items={[item]}
      total={1}
      page={1}
      pageSize={20}
      sort="-createdAt"
      hasFilters={false}
      canWrite
      labels={labels}
      columnLabels={{
        name: 'Name',
        topic: 'Topic',
        status: 'Status',
        created: 'Received',
        actions: 'Actions',
      }}
      statusLabels={{ NEW: 'New', READ: 'Read', REPLIED: 'Replied', SPAM: 'Spam' }}
      actionLabels={{ read: 'Mark read', spam: 'Mark spam' }}
      onSortChange={vi.fn()}
      onPageChange={vi.fn()}
      onMarkRead={onMarkRead}
      onMarkSpam={vi.fn()}
      onClearFilters={vi.fn()}
      onRetry={vi.fn()}
    />,
  );
  return { onMarkRead };
}

describe('InboxTable', () => {
  afterEach(cleanup);

  it('renders the message as a link to its detail page', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Ana' })).toHaveAttribute('href', '/admin/inbox/9');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('marks a row read from the actions column', async () => {
    const { onMarkRead } = renderTable();
    const button = screen.getByRole('button', { name: 'Mark read' });
    expect(button.closest('a')).toBeNull();
    await userEvent.click(button);
    expect(onMarkRead).toHaveBeenCalledWith(item);
  });
});
