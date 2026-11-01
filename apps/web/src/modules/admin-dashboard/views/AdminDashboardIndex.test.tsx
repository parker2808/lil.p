import { adminHealthFixture, adminStatsFixture, type Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  fetchUnreadCount: vi.fn().mockResolvedValue({ unread: 0 }),
}));

vi.mock('@/modules/admin-insights/services/admin-audit.service', () => ({
  LATEST_AUDIT_PARAMS: { limit: 8 },
  listAdminAudit: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
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
  afterEach(cleanup);

  it('keeps the action cards visible when the health card fails', async () => {
    fetchStats.mockResolvedValue(adminStatsFixture);
    fetchHealth.mockRejectedValue(new Error('health down'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Unpublished drafts' })).toBeInTheDocument();
    });
    expect(screen.getByRole('region', { name: 'Page views · 30d' })).toBeInTheDocument();
    expect(screen.getByText('Content health could not be loaded.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('Projects without a domain · 1')).toBeNull();
  });

  it('renders the four action cards for an admin, each with a link', async () => {
    fetchStats.mockResolvedValue(adminStatsFixture);
    fetchHealth.mockResolvedValue(adminHealthFixture);

    renderDashboard();

    expect(await screen.findByText('Inbox zero')).toBeInTheDocument();
    const expected = [
      ['Unread messages', '/admin/inbox'],
      ['Unpublished drafts', '/admin/projects?status=DRAFT'],
      ['Page views · 30d', '/admin/analytics'],
      ['Recent activity', '/admin/audit'],
    ] as const;
    for (const [name, href] of expected) {
      const card = await screen.findByRole('region', { name });
      expect(within(card).getAllByRole('link')[0]).toHaveAttribute('href', href);
    }
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
  });
});
