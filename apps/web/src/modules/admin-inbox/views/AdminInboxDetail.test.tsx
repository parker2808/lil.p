import {
  type AdminContactMessage,
  type AdminContactMessageListPage,
  adminContactMessageListParamsSchema,
  type Me,
  qk,
} from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

import en from '../../../../i18n/locales/en.json';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams('page=2'),
}));

vi.mock('../services/admin-inbox.service', () => ({
  getAdminMessage: vi.fn(),
  updateAdminMessage: vi.fn(),
}));

vi.mock('@/modules/core/utils/toast-undo.util', () => ({ toastUndo: vi.fn() }));

import { toastUndo } from '@/modules/core/utils/toast-undo.util';

import { getAdminMessage, updateAdminMessage } from '../services/admin-inbox.service';
import { AdminInboxDetail } from './AdminInboxDetail';

const getMessage = vi.mocked(getAdminMessage);
const updateMessage = vi.mocked(updateAdminMessage);
const visitorEmail = ['ana', 'example.com'].join('@');

const base: AdminContactMessage = {
  id: 9,
  name: 'Ana',
  email: visitorEmail,
  topicId: 1,
  topic: { id: 1, slug: 'job', labelEn: 'Job', labelVi: 'Việc' },
  message: 'Hello there',
  locale: 'en',
  status: 'NEW',
  createdAt: '2026-10-26T12:00:00.000Z',
  updatedAt: '2026-10-26T12:00:00.000Z',
};

function renderDetail(message: AdminContactMessage, role: Me['role'] = 'admin') {
  let stored = message;
  getMessage.mockImplementation(async () => stored);
  updateMessage.mockImplementation(async (_id, body) => {
    stored = { ...stored, ...body };
    return stored;
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const params = adminContactMessageListParamsSchema.parse({});
  client.setQueryData<AdminContactMessageListPage>(qk.admin.list('messages', params), {
    items: [message],
    page: 1,
    pageSize: 20,
    total: 1,
  });
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={{ id: 1, email: '<email>', name: 'Parker', role }}>
          <AdminInboxDetail id={message.id} />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
  return { client, listKey: qk.admin.list('messages', params) };
}

describe('AdminInboxDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('marks a new message read once when it opens', async () => {
    renderDetail(base);

    await waitFor(() => expect(updateMessage).toHaveBeenCalledWith(9, { status: 'READ' }));
    expect(await screen.findByText('Read')).toBeInTheDocument();
    expect(updateMessage).toHaveBeenCalledOnce();
  });

  it('replies through a mailto link with the topic as subject', async () => {
    renderDetail({ ...base, status: 'READ' });

    const reply = await screen.findByRole('link', { name: 'Reply via email' });
    expect(reply).toHaveAttribute('href', `mailto:${visitorEmail}?subject=Re%3A%20Job`);
    expect(updateMessage).not.toHaveBeenCalled();
  });

  it('archives back to the list and Undo restores the previous status', async () => {
    const { client, listKey } = renderDetail({ ...base, status: 'REPLIED' });

    await userEvent.click(await screen.findByRole('button', { name: 'Archive' }));

    expect(updateMessage).toHaveBeenCalledWith(9, { status: 'ARCHIVED' });
    expect(client.getQueryData<AdminContactMessageListPage>(listKey)?.items).toEqual([]);
    expect(replace).toHaveBeenCalledWith('/admin/inbox?page=2');
    const [message, onUndo] = vi.mocked(toastUndo).mock.calls[0]!;
    expect(message).toBe('Message archived');

    onUndo();
    await waitFor(() => expect(updateMessage).toHaveBeenLastCalledWith(9, { status: 'REPLIED' }));
  });

  it('leaves the message unread and read-only for a reviewer', async () => {
    renderDetail(base, 'user');

    expect(await screen.findByRole('link', { name: 'Reply via email' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive' })).toBeNull();
    expect(updateMessage).not.toHaveBeenCalled();
  });
});
