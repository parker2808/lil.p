import type { AdminPost, AdminTag, Me } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
HTMLElement.prototype.scrollIntoView = vi.fn();

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
      aria-label="Body"
      value={value}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/modules/core/services/api-client.service', () => ({
  apiClient: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/modules/admin-taxonomy/services/tags.service', () => ({
  tagsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
}));

vi.mock('../services/admin-posts.service', () => ({
  createAdminPost: vi.fn(),
  updateAdminPost: vi.fn(),
  getAdminPost: vi.fn(),
  listAdminPosts: vi.fn(),
  archiveAdminPost: vi.fn(),
}));

import { tagsApi } from '@/modules/admin-taxonomy/services/tags.service';

import { createAdminPost, getAdminPost, updateAdminPost } from '../services/admin-posts.service';
import { AdminPostsEditor } from './AdminPostsEditor';

const create = vi.mocked(createAdminPost);
const update = vi.mocked(updateAdminPost);
const getPost = vi.mocked(getAdminPost);
const createTag = vi.mocked(tagsApi.create);

const admin: Me = { id: 1, email: '<email>', name: 'Owner', role: 'admin' };
const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };

const draft: AdminPost = {
  id: 1,
  slug: 'vue-to-react',
  titleEn: 'Vue to React',
  titleVi: '',
  excerptEn: 'What transfers.',
  excerptVi: '',
  bodyEn: 'TODO: finish this note',
  bodyVi: '',
  takeawaysEn: '',
  takeawaysVi: '',
  seoTitleEn: null,
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  readingMinutes: 4,
  isFeatured: false,
  status: 'DRAFT',
  publishedAt: null,
  sortOrder: 0,
  coverId: null,
  tagIds: [],
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderEditor(me: Me, postId: number | null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <MeProvider me={me}>
          <AdminPostsEditor postId={postId} />
        </MeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('AdminPostsEditor', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a publish-lint warning when the body contains TODO', async () => {
    getPost.mockResolvedValue(draft);
    renderEditor(admin, 1);
    expect((await screen.findAllByText('Must not contain TODO')).length).toBeGreaterThan(0);
  });

  it('adds a tag created from the combobox', async () => {
    const created: AdminTag = {
      id: 9,
      slug: 'sql',
      nameEn: 'sql',
      nameVi: '',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    createTag.mockResolvedValue(created);
    renderEditor(admin, null);
    await userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
    await userEvent.type(screen.getByLabelText('Search tags'), 'sql');
    await userEvent.click(await screen.findByRole('option', { name: /Create/ }));
    expect(createTag).toHaveBeenCalledWith({ nameEn: 'sql', nameVi: '' });
    expect(await screen.findByText('sql')).toBeInTheDocument();
  });

  it('does not send writes when the viewer is a user', async () => {
    renderEditor(user, null);
    expect(screen.getByText('Read only')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeDisabled();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(createTag).not.toHaveBeenCalled();
  });
});
