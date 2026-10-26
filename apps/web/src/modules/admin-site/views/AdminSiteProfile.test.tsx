import type { AdminProfile, Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: () => null,
}));

vi.mock('../services/profile.service', () => ({
  getAdminProfile: vi.fn(),
  updateAdminProfile: vi.fn(),
}));

import { getAdminProfile, updateAdminProfile } from '../services/profile.service';
import { AdminSiteProfile } from './AdminSiteProfile';

const getProfile = vi.mocked(getAdminProfile);
const update = vi.mocked(updateAdminProfile);

const admin: Me = { id: 1, email: '<email>', name: 'Owner', role: 'admin' };

const profile: AdminProfile = {
  id: 1,
  displayName: 'Owner',
  legalName: 'Owner',
  city: 'City',
  country: 'VN',
  timezone: 'Asia/Ho_Chi_Minh',
  careerStartDate: '2018-01-01',
  headlineEn: 'Hello world',
  headlineVi: '',
  subheadlineEn: '',
  subheadlineVi: '',
  bioEn: '',
  bioVi: '',
  languagesEn: '',
  languagesVi: '',
  heroKickerEn: null,
  heroKickerVi: null,
  headlineAccentEn: 'world',
  headlineAccentVi: null,
  avatarId: null,
  avatar: null,
  resumeEnId: null,
  resumeViId: null,
  resumeEn: null,
  resumeVi: null,
  phone: '<phone>',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AdminSiteProfile', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a field error when the accent is not in the headline', async () => {
    getProfile.mockResolvedValue(profile);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QueryClientProvider client={client}>
          <MeProvider me={admin}>
            <AdminSiteProfile />
          </MeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>,
    );
    const accent = await screen.findByLabelText('Accent');
    await userEvent.clear(accent);
    await userEvent.type(accent, 'nope');
    await userEvent.tab();
    expect(await screen.findByText('Must appear in the headline')).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });
});
