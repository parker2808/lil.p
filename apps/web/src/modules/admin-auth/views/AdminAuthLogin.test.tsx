import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { APP_TIME_ZONE } from '../../../../i18n/timezone';

const {
  replace,
  clientHasAdminSession,
  hasAdminLoginAutoRedirected,
  markAdminLoginAutoRedirected,
} = vi.hoisted(() => ({
  replace: vi.fn(),
  clientHasAdminSession: vi.fn(),
  hasAdminLoginAutoRedirected: vi.fn(),
  markAdminLoginAutoRedirected: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../utils/client-session.util', () => ({
  clientHasAdminSession: () => clientHasAdminSession(),
  hasAdminLoginAutoRedirected: () => hasAdminLoginAutoRedirected(),
  markAdminLoginAutoRedirected: () => markAdminLoginAutoRedirected(),
}));

import { AdminAuthLogin } from './AdminAuthLogin';

function renderLogin() {
  return render(
    <NextIntlClientProvider locale="en" messages={en} timeZone={APP_TIME_ZONE}>
      <AdminAuthLogin />
    </NextIntlClientProvider>,
  );
}

describe('AdminAuthLogin', () => {
  afterEach(() => {
    cleanup();
    replace.mockReset();
    clientHasAdminSession.mockReset();
    hasAdminLoginAutoRedirected.mockReset();
    markAdminLoginAutoRedirected.mockReset();
  });

  it('redirects once when a client-side /api/auth/me succeeds', async () => {
    hasAdminLoginAutoRedirected.mockReturnValue(false);
    clientHasAdminSession.mockResolvedValue(true);
    renderLogin();
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/admin');
    });
    expect(markAdminLoginAutoRedirected).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('shows the form when /api/auth/me fails', async () => {
    hasAdminLoginAutoRedirected.mockReturnValue(false);
    clientHasAdminSession.mockResolvedValue(false);
    renderLogin();
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('stays on the form if the server layout bounced back', async () => {
    hasAdminLoginAutoRedirected.mockReturnValue(true);
    renderLogin();
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(clientHasAdminSession).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
