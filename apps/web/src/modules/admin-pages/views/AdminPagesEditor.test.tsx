import type { AdminPage, Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

const page: AdminPage = {
  key: 'home',
  seoTitleEn: 'Home',
  seoTitleVi: '',
  seoDescriptionEn: '',
  seoDescriptionVi: '',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedVersion: null,
  publishedAt: null,
  hasUnpublishedChanges: true,
  blocks: [
    {
      id: 1,
      type: 'hero',
      key: 'hero',
      layout: 'SPLIT_7_5',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: {
        primaryCta: { label: { en: 'View', vi: '' }, href: '/projects' },
        showDiagram: true,
        showAvailability: true,
      },
      isVisible: true,
      sortOrder: 0,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

const add = vi.fn();
const reorder = vi.fn();
const update = vi.fn();

vi.mock('../hooks/use-admin-page.hook', () => ({
  useAdminPage: () => ({ data: page, refetch: vi.fn() }),
}));

vi.mock('../hooks/use-page-versions.hook', () => ({
  usePageVersions: () => ({ data: [], isError: false }),
  usePageVersion: () => ({ data: undefined }),
  usePublishPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRestorePage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDiscardPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-block-mutations.hook', () => ({
  useBlockMutations: () => ({
    add: { mutate: add },
    update: { mutateAsync: update },
    duplicate: { mutate: vi.fn() },
    remove: { mutate: vi.fn() },
    toggle: { mutate: vi.fn() },
    reorder: { mutate: reorder },
    savePage: { mutateAsync: vi.fn() },
  }),
}));

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: () => null,
}));

import { AdminPagesEditor } from './AdminPagesEditor';

const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };

function renderEditor(me: Me) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={me}>
          <AdminPagesEditor pageKey="home" />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('AdminPagesEditor', () => {
  beforeEach(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    cleanup();
    add.mockReset();
    reorder.mockReset();
    update.mockReset();
  });

  it('is read-only for a user and still offers Open page', () => {
    renderEditor(user);
    expect(screen.getByText('Read only')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add block' })).toBeNull();
    expect(screen.queryByLabelText('Drag to reorder')).toBeNull();
    expect(add).not.toHaveBeenCalled();
    expect(reorder).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
