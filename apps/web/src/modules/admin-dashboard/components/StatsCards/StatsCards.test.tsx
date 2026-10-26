import { adminStatsFixture } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { StatsCardsView } from './StatsCards';

describe('StatsCards', () => {
  it('renders counts from the API payload', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <StatsCardsView stats={adminStatsFixture} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Projects published')).toBeInTheDocument();
    expect(screen.getByText('Posts published')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Published this period')).toBeInTheDocument();
    expect(screen.getAllByText('+1 vs previous 30d')).toHaveLength(2);
    expect(screen.getByText('+2 vs previous 30d')).toBeInTheDocument();
  });
});
