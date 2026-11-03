import type { AdminPage } from '@portfolio/contracts';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';
import { ApiError } from '@/modules/core/utils/api-error.util';

const publish = vi.hoisted(() => vi.fn());

vi.mock('../../hooks/use-page-versions.hook', () => ({
  usePublishPage: () => ({ mutateAsync: publish, isPending: false }),
  useDiscardPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/modules/admin-core/hooks/use-me.hook', () => ({
  useIsAdmin: () => true,
  useMe: () => ({ role: 'admin' }),
}));
vi.mock('@/modules/admin-core/stores/admin-ui.store', () => ({
  usePublishAction: () => undefined,
}));

import { PublishBar } from './PublishBar';

const page: AdminPage = {
  key: 'ideas',
  title: 'Ideas',
  locale: 'en',
  seoTitleEn: 'Ideas',
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedVersion: null,
  publishedAt: null,
  hasUnpublishedChanges: true,
  blocks: [],
};

afterEach(() => {
  cleanup();
  publish.mockReset();
});

describe('custom page publish error', () => {
  it.each([
    ['en', en, 'en', 'Add visible body copy'],
    ['en', en, 'vi', 'Add visible body copy'],
    ['vi', viMessages, 'en', 'Thêm nội dung hiển thị'],
    ['vi', viMessages, 'vi', 'Thêm nội dung hiển thị'],
  ] as const)('uses %s UI text for a %s page', async (uiLocale, messages, pageLocale, expected) => {
    publish.mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'PAGE_BODY_REQUIRED',
        message: 'Validation failed',
        fieldErrors: { body: ['Add copy'] },
      }),
    );
    render(
      <NextIntlClientProvider locale={uiLocale} messages={messages}>
        <PublishBar pageKey="ideas" page={{ ...page, locale: pageLocale }} onInvalid={vi.fn()} />
      </NextIntlClientProvider>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: uiLocale === 'vi' ? 'Xuất bản' : 'Publish' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveAttribute('data-field-path', 'body'),
    );
    const link = screen.getByRole('link', { name: new RegExp(expected) });
    expect(link).toHaveAttribute('href', '#page-body-editor');
    expect(screen.queryByText('Validation failed')).toBeNull();
  });
});
