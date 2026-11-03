import type { Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: ({
    value,
    onChange,
    readOnly,
  }: {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <textarea
      aria-label="Highlights"
      value={value}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/modules/core/services/api-client.service', () => ({
  apiClient: vi.fn().mockResolvedValue([]),
}));

vi.mock('../services/experience.service', () => ({
  createAdminExperience: vi.fn(),
  updateAdminExperience: vi.fn(),
  getAdminExperience: vi.fn(),
  listAdminExperience: vi.fn(),
  removeAdminExperience: vi.fn(),
  reorderAdminExperience: vi.fn(),
}));

import { createAdminExperience, updateAdminExperience } from '../services/experience.service';
import { AdminAboutExperienceEditor } from './AdminAboutExperienceEditor';

const create = vi.mocked(createAdminExperience);
const update = vi.mocked(updateAdminExperience);

const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };
const admin: Me = { ...user, role: 'admin' };

describe('AdminAboutExperienceEditor', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not send writes when the viewer is a user', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QueryClientProvider client={client}>
          <MeProvider me={user}>
            <AdminAboutExperienceEditor experienceId={null} />
          </MeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Read only')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeDisabled();
    expect(screen.getByLabelText('Highlights')).toBeDisabled();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('shows linked field validation before creating a standalone role', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QueryClientProvider client={client}>
          <MeProvider me={admin}>
            <AdminAboutExperienceEditor experienceId={null} />
          </MeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save role' }));
    expect(screen.getByText('Company is required.')).toBeVisible();
    expect(screen.getByText('Location is required.')).toBeVisible();
    expect(screen.getByText('English role is required.')).toBeVisible();
    expect(create).not.toHaveBeenCalled();
  });
});
