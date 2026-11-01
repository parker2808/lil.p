import type { AdminAuditLog } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { ActivityCardView } from './ActivityCard';

const item: AdminAuditLog = {
  id: 4,
  userId: 1,
  userName: 'Admin',
  action: 'PUBLISH',
  entityType: 'project',
  entityId: '2',
  summary: 'Published project particula',
  createdAt: '2026-10-26T12:00:00.000Z',
};

afterEach(cleanup);

describe('ActivityCard', () => {
  it('links recent audit rows into the audit log', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ActivityCardView items={[item]} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Published project particula')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open audit log' })).toHaveAttribute(
      'href',
      '/admin/audit',
    );
  });

  it('renders an empty state with the audit link when there is no activity', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ActivityCardView items={[]} />
      </NextIntlClientProvider>,
    );

    const card = screen.getByRole('region', { name: 'Recent activity' });
    expect(card.querySelector('[data-slot="empty-state"]')).toHaveTextContent('No activity yet.');
    expect(screen.getByRole('link', { name: 'Open audit log' })).toHaveAttribute(
      'href',
      '/admin/audit',
    );
  });
});
