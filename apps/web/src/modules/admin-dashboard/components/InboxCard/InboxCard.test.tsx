import type { AdminContactMessage } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { InboxCardView } from './InboxCard';

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

describe('InboxCard', () => {
  it('links the latest messages into the inbox', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <InboxCardView items={[item]} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('link', { name: /Ana/ })).toHaveAttribute('href', '/admin/inbox/9');
    expect(screen.getByRole('link', { name: 'Open inbox' })).toHaveAttribute(
      'href',
      '/admin/inbox',
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
