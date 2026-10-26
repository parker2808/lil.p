import { adminHealthFixture } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { ContentHealthCardView } from './ContentHealthCard';

describe('ContentHealthCard', () => {
  it('links each v2 health issue to the item', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContentHealthCardView health={adminHealthFixture} />
      </NextIntlClientProvider>,
    );

    const projectLinks = screen.getAllByRole('link', { name: /Sample case/ });
    expect(projectLinks.length).toBeGreaterThan(0);
    for (const link of projectLinks) {
      expect(link).toHaveAttribute('href', '/admin/projects/11');
    }
    expect(screen.getByRole('link', { name: /Draft note/ })).toHaveAttribute(
      'href',
      '/admin/posts/4',
    );
    expect(screen.getByRole('link', { name: /Skills marquee/ })).toHaveAttribute(
      'href',
      '/admin/skills',
    );
    expect(screen.getByText('Projects without a domain · 1')).toBeInTheDocument();
    expect(screen.getByText('Case studies with < 2 key facts · 1')).toBeInTheDocument();
  });
});
