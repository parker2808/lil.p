import type { AdminAuditLog } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

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
});
