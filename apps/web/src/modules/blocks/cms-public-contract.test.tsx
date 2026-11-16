import { readTree, validateTreeForPublish } from '@parker2808/cms-core/tree';
import { HOST_TREE_REGISTRY } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import treeEn from '../../../../../fixtures/public-pages/tree-en.json';
import treeVi from '../../../../../fixtures/public-pages/tree-vi.json';
import legacyEn from '../../../../../fixtures/public-pages/legacy-en.json';
import legacyVi from '../../../../../fixtures/public-pages/legacy-vi.json';
import { BlocksPage } from './views/BlocksPage';
import { getPage } from './services/pages.service';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn(async () => (key: string) => key) }));
vi.mock('@i18n/navigation', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock('@/modules/content/components/Markdown/Markdown', () => ({
  Markdown: ({ source }: { source: string }) => <p>{source}</p>,
}));
vi.mock('./constants/block-renderers.constant', async () => {
  const { ProseBlock } = await import('./components/ProseBlock/ProseBlock');
  return {
    BLOCK_RENDERERS: {
      prose: { component: ProseBlock, skeleton: () => null },
      hero: { component: () => <h1>Host hero</h1>, skeleton: () => null },
    },
  };
});
vi.mock('@/modules/core/services/api-server.service', () => ({ apiServer: vi.fn() }));

const cases = [
  { kind: 'tree', locale: 'en', response: treeEn, text: 'English body' },
  { kind: 'tree', locale: 'vi', response: treeVi, text: 'Nội dung Việt' },
  { kind: 'legacy', locale: 'en', response: legacyEn, text: 'English body' },
  { kind: 'legacy', locale: 'vi', response: legacyVi, text: 'Nội dung Việt' },
] as const;

describe('B2/B4 public Page v1 contract fixtures', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it.each(cases)(
    'strictly reads and renders $kind $locale',
    async ({ kind, locale, response, text }) => {
      vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
      vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
      vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => response });
      vi.stubGlobal('fetch', fetchMock);

      if (kind === 'tree') {
        expect(readTree(response.page.tree, HOST_TREE_REGISTRY).ok).toBe(true);
        expect(validateTreeForPublish(response.page.tree, HOST_TREE_REGISTRY).ok).toBe(true);
      }
      const page = await getPage('home', locale);
      expect(page.key).toBe('home');
      expect(page.seo.lang).toBe(locale);
      expect(fetchMock.mock.calls[0]?.[0].href).toBe(
        `https://cms.example.test/api/public/pages/home?locale=${locale}`,
      );
      const html = renderToStaticMarkup(await BlocksPage({ pageKey: 'home', locale }));
      expect(html).toContain(text);
      if (kind === 'tree') {
        expect(html).toContain('data-host-block-type="hero"');
        expect(html).toContain('data-host-block-type="prose"');
      } else {
        expect(html).toContain('data-block-type="prose"');
      }
    },
  );

  it.each([
    { name: 'bare page', response: treeEn.page },
    { name: 'missing version', response: { ...treeEn, publishedVersion: undefined } },
    { name: 'wrong key', response: { ...treeEn, page: { ...treeEn.page, key: 'about' } } },
    { name: 'wrong locale', response: treeVi },
  ])('rejects $name before rendering or fallback', async ({ response }) => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_PUBLIC_API_ORIGIN', 'https://cms.example.test');
    vi.stubEnv('CMS_LEGACY_READ_FALLBACK_ENABLED', 'true');
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => response }));
    await expect(getPage('home', 'en')).rejects.toThrow('Published Page temporarily unavailable');
  });
});
