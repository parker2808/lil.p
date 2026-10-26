import type { AdminContactMessage } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
  selected: '{count} selected',
  range: '{from}–{to} of {total}',
  confirmDeleteTitle: 'spam?',
  confirmDelete: 'spam',
  bulkDelete: 'Mark spam',
  retry: 'Retry',
  previous: 'Previous',
  next: 'Next',
  columns: 'Columns',
  density: 'Density',
  densityDefault: 'Default',
  densityCompact: 'Compact',
  help: 'Shortcuts',
  helpTitle: 'Keyboard shortcuts',
  cancel: 'Cancel',
  shortcuts: {
    move: 'move',
    select: 'select',
    open: 'open',
    edit: 'edit',
    remove: 'remove',
    help: 'help',
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

describe('InboxTable', () => {
  it('marks a row read from the actions column', async () => {
    const onMarkRead = vi.fn();
    render(
      <InboxTable
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
        onOpen={vi.fn()}
        onMarkRead={onMarkRead}
        onMarkSpam={vi.fn()}
        onClearFilters={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Mark read' }));
    expect(onMarkRead).toHaveBeenCalledWith(item);
  });
});
