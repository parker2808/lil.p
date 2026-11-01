import type { Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/admin/projects/1',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: () => null,
}));

vi.mock('@/modules/core/services/api-client.service', () => ({
  apiClient: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/modules/admin-about/services/experience.service', () => ({
  listAdminExperience: vi.fn().mockResolvedValue({ items: [], page: 1, pageSize: 100, total: 0 }),
}));

vi.mock('../services/admin-projects.service', () => ({
  createAdminProject: vi.fn(),
  updateAdminProject: vi.fn(),
  getAdminProject: vi.fn(),
  listAdminProjects: vi.fn(),
  archiveAdminProject: vi.fn(),
  reorderAdminProjects: vi.fn(),
  publishAdminProject: vi.fn(),
  unpublishAdminProject: vi.fn(),
}));

import { createAdminProject, updateAdminProject } from '../services/admin-projects.service';
import { AdminProjectsEditor } from './AdminProjectsEditor';

const create = vi.mocked(createAdminProject);
const update = vi.mocked(updateAdminProject);

const admin: Me = { id: 1, email: '<email>', name: 'Owner', role: 'admin' };
const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };

function renderEditor(me: Me) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={me}>
          <AdminProjectsEditor projectId={null} />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('AdminProjectsEditor', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a field error when the English title is empty', async () => {
    renderEditor(admin);
    const title = screen.getByLabelText('Title');
    await userEvent.click(title);
    await userEvent.tab();
    expect(await screen.findByText('English title is required.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it('does not send writes when the viewer is a user', async () => {
    renderEditor(user);
    expect(screen.getByText('Read only')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeDisabled();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
