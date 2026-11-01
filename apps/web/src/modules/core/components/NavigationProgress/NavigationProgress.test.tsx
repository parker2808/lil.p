import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';

const navigation = vi.hoisted(() => ({ pathname: '/', search: '' }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

import { NavigationProgress } from './NavigationProgress';

function renderProgress(link: Record<string, string> = { href: '/en/notes' }) {
  const view = render(
    <NextIntlClientProvider locale="en" messages={en}>
      <NavigationProgress />
      <a {...link} onClick={(event) => event.preventDefault()}>
        <span>Go</span>
      </a>
    </NextIntlClientProvider>,
  );
  return { ...view, link: screen.getByText('Go') };
}

afterEach(() => {
  cleanup();
  navigation.pathname = '/';
  navigation.search = '';
});

describe('NavigationProgress', () => {
  it('shows on an internal link click and hides once the URL changes', () => {
    const { link, rerender } = renderProgress();
    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.click(link);
    expect(screen.getByRole('status')).toHaveClass('route-pending');
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    navigation.pathname = '/en/notes';
    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <NavigationProgress />
      </NextIntlClientProvider>,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows for a query-only change', () => {
    const { link } = renderProgress({ href: '/?tag=react' });
    fireEvent.click(link);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it.each([
    ['a hash link on the same page', { href: '#main' }, {}],
    ['the current URL', { href: '/' }, {}],
    ['an external link', { href: 'https://example.com/' }, {}],
    ['a new-tab link', { href: '/en/notes', target: '_blank' }, {}],
    ['a download link', { href: '/en/notes', download: '' }, {}],
    ['a modifier click', { href: '/en/notes' }, { metaKey: true }],
    ['a middle click', { href: '/en/notes' }, { button: 1 }],
  ])('ignores %s', (_, attributes, init) => {
    const { link } = renderProgress(attributes);
    fireEvent.click(link, init);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hides when the page is restored from the back-forward cache', () => {
    const { link } = renderProgress();
    fireEvent.click(link);
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
