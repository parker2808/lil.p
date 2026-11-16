import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { draftMode, apiServer } = vi.hoisted(() => ({ draftMode: vi.fn(), apiServer: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ draftMode }));
vi.mock('@/modules/core/services/api-server.service', () => ({ apiServer }));

async function getPage(...args: Parameters<typeof import('./pages.service').getPage>) {
  return (await import('./pages.service')).getPage(...args);
}

const page = {
  key: 'home',
  seo: { title: 'Published', description: null, lang: 'vi' },
  tree: { schemaVersion: 1, root: { id: 'page-root', type: 'page', sections: [] } },
};

describe('CMS published Page reader', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('defaults off and preserves the legacy public read', async () => {
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.mocked(apiServer).mockResolvedValue(page);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPage('home', 'vi')).resolves.toEqual(page);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(apiServer).toHaveBeenCalledWith('/api/public/pages/home', {
      locale: 'vi',
      tags: ['page:home'],
      schema: expect.anything(),
    });
  });

  it('accepts only a versioned published DTO and does not send admin credentials', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ contractVersion: 1, publishedVersion: 4, page }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPage('home', 'vi')).resolves.toEqual(page);
    expect(apiServer).not.toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe('https://cms.example.test/api/public/pages/home?locale=vi');
    expect(init).toMatchObject({
      method: 'GET',
      next: { revalidate: 30, tags: ['cms:page:home:vi'] },
    });
    expect(init.headers).toBeUndefined();
  });

  it.each([
    { contractVersion: 2, publishedVersion: 4, page },
    { contractVersion: 1, publishedVersion: 4, page: { ...page, invalidBlocks: [] } },
    { contractVersion: 1, publishedVersion: 4, page: { ...page, key: 'about' } },
    {
      contractVersion: 1,
      publishedVersion: 4,
      page: { ...page, seo: { ...page.seo, lang: 'en' } },
    },
  ])('rejects an invalid CMS envelope even if legacy fallback is enabled', async (body) => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_LEGACY_READ_FALLBACK_ENABLED', 'true');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.mocked(apiServer).mockResolvedValue(page);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body }));

    await expect(getPage('home', 'vi')).rejects.toThrow('Published Page temporarily unavailable');
    expect(apiServer).not.toHaveBeenCalled();
  });

  it('uses a validated last-good snapshot during a CMS timeout', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ contractVersion: 1, publishedVersion: 4, page }),
        })
        .mockRejectedValueOnce(new DOMException('timeout', 'TimeoutError')),
    );

    await expect(getPage('home', 'vi')).resolves.toEqual(page);
    await expect(getPage('home', 'vi')).resolves.toEqual(page);
    expect(apiServer).not.toHaveBeenCalled();
  });

  it('does not serve last-good on an unpublished 404 response', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ contractVersion: 1, publishedVersion: 4, page }),
        })
        .mockResolvedValueOnce({ ok: false, status: 404 }),
    );

    await getPage('home', 'vi');
    await expect(getPage('home', 'vi')).rejects.toThrow('Published Page temporarily unavailable');
    expect(apiServer).not.toHaveBeenCalled();
  });

  it('expires the last-good CMS response after 24 hours', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ contractVersion: 1, publishedVersion: 4, page }),
        })
        .mockRejectedValueOnce(new DOMException('timeout', 'TimeoutError')),
    );

    await getPage('home', 'vi');
    clock.mockReturnValue(1000 + 24 * 60 * 60 * 1000 + 1);
    await expect(getPage('home', 'vi')).rejects.toThrow('Published Page temporarily unavailable');
    expect(apiServer).not.toHaveBeenCalled();
  });

  it('fails closed without a valid last-good snapshot or approved legacy fallback', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));
    await expect(getPage('home', 'vi')).rejects.toThrow('Published Page temporarily unavailable');
    expect(apiServer).not.toHaveBeenCalled();
  });

  it('allows the legacy published source only when explicitly approved during a timeout', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_LEGACY_READ_FALLBACK_ENABLED', 'true');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.mocked(apiServer).mockResolvedValue(page);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));
    await expect(getPage('home', 'vi')).resolves.toEqual(page);
    expect(apiServer).toHaveBeenCalledWith('/api/public/pages/home', expect.anything());
  });

  it('never sends authorized preview reads to CMS, even when the flag is on', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true } as never);
    vi.mocked(apiServer).mockResolvedValue(page);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await getPage('home', 'vi', 2);
    expect(apiServer).toHaveBeenCalledWith('/api/admin/preview/pages/home?version=2', {
      locale: 'vi',
      withAuth: true,
      schema: expect.anything(),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
