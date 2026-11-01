import { adminStatsFixture } from '@portfolio/contracts';
import { cleanup, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { DraftsCardView, UnreadCardView, ViewsCardView } from './ActionCards';

afterEach(cleanup);

function renderEn(node: ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {node}
    </NextIntlClientProvider>,
  );
}

function emptyCounts() {
  return { ...adminStatsFixture.projects, draft: 0 };
}

describe('UnreadCard', () => {
  it('shows the unread count and links to unread messages', () => {
    renderEn(<UnreadCardView unread={3} />);
    const card = screen.getByRole('region', { name: 'Unread messages' });
    expect(within(card).getByText('3')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Open inbox' })).toHaveAttribute(
      'href',
      '/admin/inbox?status=NEW',
    );
  });

  it('renders an empty state and still links to the inbox at zero', () => {
    renderEn(<UnreadCardView unread={0} />);
    const card = screen.getByRole('region', { name: 'Unread messages' });
    expect(within(card).getByText('Inbox zero')).toBeInTheDocument();
    expect(card.querySelector('[data-slot="empty-state"]')).not.toBeNull();
    expect(within(card).getByRole('link', { name: 'Open inbox' })).toHaveAttribute(
      'href',
      '/admin/inbox',
    );
  });
});

describe('DraftsCard', () => {
  it('sums drafts and links each type to its filtered list', () => {
    renderEn(<DraftsCardView stats={adminStatsFixture} />);
    const card = screen.getByRole('region', { name: 'Unpublished drafts' });
    expect(within(card).getByText('3')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Review drafts' })).toHaveAttribute(
      'href',
      '/admin/projects?status=DRAFT',
    );
    expect(within(card).getByRole('link', { name: '2 project drafts' })).toHaveAttribute(
      'href',
      '/admin/projects?status=DRAFT',
    );
    expect(within(card).getByRole('link', { name: '1 post draft' })).toHaveAttribute(
      'href',
      '/admin/posts?status=DRAFT',
    );
  });

  it('points the main action at posts when only posts have drafts', () => {
    renderEn(<DraftsCardView stats={{ ...adminStatsFixture, projects: emptyCounts() }} />);
    expect(screen.getByRole('link', { name: 'Review drafts' })).toHaveAttribute(
      'href',
      '/admin/posts?status=DRAFT',
    );
    expect(screen.queryByRole('link', { name: /project draft/ })).toBeNull();
  });

  it('renders an empty state when nothing is in draft', () => {
    renderEn(
      <DraftsCardView
        stats={{ projects: emptyCounts(), posts: { ...adminStatsFixture.posts, draft: 0 } }}
      />,
    );
    expect(screen.getByText('Everything is published')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review drafts' })).toHaveAttribute(
      'href',
      '/admin/projects?status=DRAFT',
    );
  });
});

describe('ViewsCard', () => {
  it('compares page views with the previous period and links to analytics', () => {
    renderEn(<ViewsCardView stats={adminStatsFixture} />);
    const card = screen.getByRole('region', { name: 'Page views · 30d' });
    expect(within(card).getByText('12')).toBeInTheDocument();
    expect(within(card).getByText('+4 vs previous 30d')).toBeInTheDocument();
    expect(within(card).getByRole('img', { name: 'Views over the period' })).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Open analytics' })).toHaveAttribute(
      'href',
      '/admin/analytics',
    );
  });

  it('keeps the selected range in the analytics link', () => {
    renderEn(<ViewsCardView stats={{ ...adminStatsFixture, range: '7d' }} />);
    expect(screen.getByRole('link', { name: 'Open analytics' })).toHaveAttribute(
      'href',
      '/admin/analytics?range=7d',
    );
  });

  it('renders an empty state when there are no views in either period', () => {
    renderEn(
      <ViewsCardView
        stats={{
          range: '30d',
          views: { ...adminStatsFixture.views, total: 0, previousTotal: 0, byDay: [] },
        }}
      />,
    );
    expect(screen.getByText('No page views yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open analytics' })).toBeInTheDocument();
  });
});
