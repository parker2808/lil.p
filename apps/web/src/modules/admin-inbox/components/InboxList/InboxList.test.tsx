import type { AdminContactMessage } from '@portfolio/contracts';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InboxList, type InboxListLabels } from './InboxList';

function message(over: Partial<AdminContactMessage>): AdminContactMessage {
  return {
    id: 1,
    name: 'Ana',
    email: '<email>',
    topicId: null,
    topic: null,
    message: 'Hello there',
    locale: 'en',
    status: 'READ',
    createdAt: '2026-10-26T12:00:00.000Z',
    updatedAt: '2026-10-26T12:00:00.000Z',
    ...over,
  };
}

const labels: InboxListLabels = {
  empty: 'No messages yet.',
  noResults: 'No matching messages.',
  clearFilters: 'Clear filters',
  error: 'Inbox could not be loaded.',
  retry: 'Retry',
  range: ({ from, to, total }) => `${from}–${to} of ${total}`,
  previous: 'Previous',
  next: 'Next',
  noTopic: 'No topic',
};

const statusLabels = {
  NEW: 'New',
  READ: 'Read',
  REPLIED: 'Replied',
  SPAM: 'Spam',
  ARCHIVED: 'Archived',
};

function renderList(props: Partial<Parameters<typeof InboxList>[0]> = {}) {
  const handlers = { onPageChange: vi.fn(), onClearFilters: vi.fn(), onRetry: vi.fn() };
  render(
    <NextIntlClientProvider locale="en" messages={{}}>
      <InboxList
        label="Messages"
        items={[]}
        hrefFor={(item) => `/admin/inbox/${item.id}?status=NEW`}
        total={0}
        page={1}
        pageSize={20}
        hasFilters={false}
        labels={labels}
        statusLabels={statusLabels}
        {...handlers}
        {...props}
      />
    </NextIntlClientProvider>,
  );
  return handlers;
}

describe('InboxList', () => {
  afterEach(cleanup);

  it('links each message to its detail route and marks the selected and unread rows', () => {
    renderList({
      items: [
        message({ id: 1, name: 'Ana', status: 'NEW' }),
        message({ id: 2, name: 'Bao', status: 'ARCHIVED', topic: null }),
      ],
      total: 2,
      selectedId: 2,
    });

    const list = screen.getByRole('list', { name: 'Messages' });
    const [unread, selected] = within(list).getAllByRole('link');
    expect(unread).toHaveAttribute('href', '/admin/inbox/1?status=NEW');
    expect(unread).toHaveAccessibleName(/Ana New/);
    expect(unread).not.toHaveAttribute('aria-current');
    expect(selected).toHaveAttribute('aria-current', 'page');
    expect(selected).toHaveAttribute('data-status', 'ARCHIVED');
    expect(within(selected!).getByText('Archived')).toBeInTheDocument();
    expect(within(selected!).getByText('No topic')).toBeInTheDocument();
  });

  it('pages through long lists', async () => {
    const { onPageChange } = renderList({
      items: [message({ id: 1 })],
      total: 45,
      page: 2,
    });

    expect(screen.getByText('21–40 of 45')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it('offers to clear filters when nothing matches', async () => {
    const { onClearFilters } = renderList({ hasFilters: true });

    expect(screen.getByText('No matching messages.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('shows the empty inbox and the error state with retry', async () => {
    renderList();
    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
    cleanup();

    const { onRetry } = renderList({ isError: true });
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
