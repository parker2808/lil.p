import type { Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { MeProvider } from '../../hooks/use-me.hook';

vi.mock('@/modules/admin-inbox/services/admin-inbox.service', () => ({
  fetchUnreadCount: vi.fn().mockResolvedValue({ unread: 3 }),
}));

import { NotificationBell } from './NotificationBell';

const admin: Me = { id: 1, email: '<email>', name: 'Parker', role: 'admin' };
const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };

function renderBell(me: Me) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={me}>
          <NotificationBell />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('NotificationBell', () => {
  it('hides the bell from a user reviewer', () => {
    renderBell(user);
    expect(screen.queryByRole('link', { name: /unread messages/ })).toBeNull();
  });

  it('shows the unread count without stealing focus', async () => {
    renderBell(admin);
    const link = await screen.findByRole('link', { name: '3 unread messages' });
    expect(link).toHaveAttribute('href', '/admin/inbox');
    expect(link).toHaveTextContent('3');
    await waitFor(() => {
      expect(screen.getByText('3 unread messages')).toBeInTheDocument();
    });
    expect(document.activeElement).not.toBe(link);
  });
});
