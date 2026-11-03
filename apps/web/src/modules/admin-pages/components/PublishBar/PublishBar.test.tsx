import type { AdminPage, Me } from '@portfolio/contracts';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';
import { MeProvider } from '@/modules/admin-core/hooks/use-me.hook';
import { ApiError } from '@/modules/core/utils/api-error.util';

const publish = vi.fn();
vi.mock('../../hooks/use-page-versions.hook', () => ({
  usePublishPage: () => ({ mutateAsync: publish, isPending: false }),
  useDiscardPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { PublishBar } from './PublishBar';

const admin: Me = { id: 1, email: '<email>', name: 'Demo', role: 'admin' };
const basePage: AdminPage = {
  key: 'ideas',
  title: 'Ideas',
  locale: 'en',
  seoTitleEn: 'Ideas',
  seoTitleVi: null,
  seoDescriptionEn: null,
  seoDescriptionVi: null,
  updatedAt: '2026-11-02T12:00:00.000Z',
  publishedVersion: null,
  publishedAt: null,
  hasUnpublishedChanges: true,
  blocks: [],
};

describe('PublishBar', () => {
  afterEach(() => {
    cleanup();
    publish.mockReset();
  });

  it.each([
    ['en', 'vi', en, 'Add visible body copy before publishing.'],
    ['vi', 'en', viMessages, 'Thêm nội dung hiển thị trước khi xuất bản.'],
  ] as const)(
    'uses %s UI copy for a %s page publish error',
    async (uiLocale, pageLocale, messages, expected) => {
      publish.mockRejectedValue(
        new ApiError({
          status: 400,
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          fieldErrors: {
            body: ['Add visible body copy before publishing'],
            [`block:prose.body.${pageLocale}`]: ['Enter substantive body copy before publishing'],
          },
        }),
      );
      const onInvalid = vi.fn();
      const onFieldErrors = vi.fn();
      render(
        <NextIntlClientProvider locale={uiLocale} messages={messages}>
          <MeProvider me={admin}>
            <PublishBar
              pageKey="ideas"
              page={{ ...basePage, locale: pageLocale }}
              onInvalid={onInvalid}
              onFieldErrors={onFieldErrors}
            />
          </MeProvider>
        </NextIntlClientProvider>,
      );
      await userEvent.click(
        screen.getByRole('button', { name: uiLocale === 'vi' ? 'Xuất bản' : 'Publish' }),
      );
      expect(await screen.findByText(expected)).toBeInTheDocument();
      await waitFor(() =>
        expect(onFieldErrors).toHaveBeenCalledWith({
          body: [expected],
          [`block:prose.body.${pageLocale}`]: [expected],
        }),
      );
      expect(onInvalid).toHaveBeenCalledWith(['prose']);
      expect(screen.queryByText('Validation failed')).toBeNull();
    },
  );
});
