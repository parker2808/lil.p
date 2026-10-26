import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { ChannelCardsView } from './ChannelCards';

const address = ['owner', 'example.com'].join('@');

describe('ChannelCards', () => {
  afterEach(() => {
    cleanup();
  });

  it('puts the address only on the mailto link', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ChannelCardsView
          email={address}
          socialLinks={[
            {
              id: 1,
              kind: 'GITHUB',
              label: 'parker2808',
              url: 'https://github.com/parker2808',
              showInHeader: false,
              showInCta: true,
              lang: 'en',
            },
          ]}
          labels={{ email: 'Email', github: 'GitHub', linkedin: 'LinkedIn' }}
        />
      </NextIntlClientProvider>,
    );

    const mail = screen.getByRole('link', { name: 'Email' });
    expect(mail).toHaveAttribute('href', `mailto:${address}`);
    expect(mail).toHaveTextContent('Email');
    expect(mail.textContent).not.toContain(address);
    expect(screen.getByRole('link', { name: 'parker2808' })).toHaveAttribute(
      'href',
      'https://github.com/parker2808',
    );
  });
});
