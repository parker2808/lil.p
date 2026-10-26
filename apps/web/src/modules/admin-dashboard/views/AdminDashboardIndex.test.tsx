import { adminStatsFixture, type Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

import en from '../../../../i18n/locales/en.json';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('../services/dashboard.service', () => ({
  fetchAdminStats: vi.fn(),
  fetchAdminHealth: vi.fn(),
}));

vi.mock('@/modules/admin-inbox/services/admin-inbox.service', () => ({
  LATEST_INBOX_PARAMS: { page: 1, pageSize: 5, sort: '-createdAt' },
  listAdminMessages: vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 5, total: 0 }),
  fetchUnreadCount: vi.fn().mockResolvedValue({ unread: 0 }),
}));

import { fetchAdminHealth, fetchAdminStats } from '../services/dashboard.service';
import { AdminDashboardIndex } from './AdminDashboardIndex';

const fetchStats = vi.mocked(fetchAdminStats);
const fetchHealth = vi.mocked(fetchAdminHealth);

const admin: Me = { id: 1, email: '<email>', name: 'Parker', role: 'admin' };

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={admin}>
          <AdminDashboardIndex range="30d" />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('AdminDashboardIndex', () => {
  it('keeps stats visible when the health card fails', async () => {
    fetchStats.mockResolvedValue(adminStatsFixture);
    fetchHealth.mockRejectedValue(new Error('health down'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Projects published')).toBeInTheDocument();
    });
    expect(screen.getByText('Content health could not be loaded.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('Projects without a domain · 1')).toBeNull();
  });
});
