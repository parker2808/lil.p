import type { Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
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
});
