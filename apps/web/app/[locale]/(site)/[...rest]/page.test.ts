import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/modules/core/utils/api-error.util';

const mocks = vi.hoisted(() => ({
  getPage: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  }),
  setRequestLocale: vi.fn(),
}));

vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }));
vi.mock('next-intl/server', () => ({
  setRequestLocale: mocks.setRequestLocale,
  getTranslations: vi.fn(),
}));
vi.mock('@/modules/blocks/services/pages.service', () => ({ getPage: mocks.getPage }));
vi.mock('@/modules/blocks/views/BlocksPage', () => ({ BlocksPage: () => null }));
vi.mock('@/modules/seo/utils/build-page-metadata.util', () => ({
  buildPageMetadata: vi.fn(),
}));

import UnknownSitePage from './page';

function customPage(locale: 'en' | 'vi' = 'en') {
  return UnknownSitePage({
    params: Promise.resolve({ locale, rest: ['demo-error'] }),
    searchParams: Promise.resolve({}),
  });
}

describe('custom-page route errors', () => {
  beforeEach(() => vi.clearAllMocks());

  it('turns a 404 API response for a custom-page URL into not found', async () => {
    mocks.getPage.mockRejectedValue(
      new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Page not found' }),
    );

    await expect(customPage('en')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    expect(mocks.getPage).toHaveBeenCalledWith('demo-error', 'en');
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });

  it('rethrows a 5xx API response for a custom-page URL', async () => {
    const outage = new ApiError({ status: 503, code: 'INTERNAL', message: 'API unavailable' });
    mocks.getPage.mockRejectedValue(outage);

    await expect(customPage('vi')).rejects.toBe(outage);
    expect(mocks.getPage).toHaveBeenCalledWith('demo-error', 'vi');
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it('rethrows malformed API data instead of presenting a 404', async () => {
    const invalidResponse = new Error('Invalid public page response');
    mocks.getPage.mockRejectedValue(invalidResponse);

    await expect(customPage()).rejects.toBe(invalidResponse);
    expect(mocks.notFound).not.toHaveBeenCalled();
  });
});
