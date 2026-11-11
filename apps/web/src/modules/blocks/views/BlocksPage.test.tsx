import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { getPage } from '../services/pages.service';
import { BlocksPage } from './BlocksPage';

vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));
vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));
vi.mock('../services/pages.service', () => ({ getPage: vi.fn() }));
vi.mock('../constants/block-renderers.constant', () => ({ BLOCK_RENDERERS: {} }));
vi.mock('../components/BlockRenderer/BlockRenderer', () => ({ BlockRenderer: () => null }));

const tree = {
  schemaVersion: 1,
  root: {
    id: 'page-root',
    type: 'page',
    responsive: { base: {} },
    sections: [
      {
        id: 'section-one',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'heading-one',
            type: 'component',
            componentType: 'heading',
            responsive: { base: { text: 'Hello <script>', level: 1 } },
          },
        ],
      },
    ],
  },
};

describe('tree route SSR', () => {
  it('does not serve a warning as HTTP 200 for an unrenderable tree', async () => {
    vi.mocked(getPage).mockResolvedValueOnce({
      key: 'ideas',
      seo: { title: 'Ideas', description: null, lang: 'en' },
      tree: {
        ...tree,
        root: {
          ...tree.root,
          sections: [
            {
              ...tree.root.sections[0]!,
              content: [
                ...tree.root.sections[0]!.content,
                { id: 'legacy', type: 'legacy-component', responsive: { base: { block: {} } } },
              ],
            },
          ],
        },
      },
    });
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: false } as never);
    await expect(BlocksPage({ pageKey: 'ideas', locale: 'en' })).rejects.toThrow('NOT_FOUND');
    expect(notFound).toHaveBeenCalledOnce();
  });

  it.each(['en', 'vi'] as const)(
    'renders identical public and authorized preview HTML in %s',
    async (locale) => {
      const publicPage = {
        key: 'ideas',
        seo: { title: 'Ideas', description: null, lang: locale },
        tree,
      };
      vi.mocked(getPage).mockResolvedValueOnce(publicPage);
      vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: false } as never);
      const published = renderToStaticMarkup(await BlocksPage({ pageKey: 'ideas', locale }));
      vi.mocked(getPage).mockResolvedValueOnce({ ...publicPage, invalidBlocks: [] });
      vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
      const preview = renderToStaticMarkup(await BlocksPage({ pageKey: 'ideas', locale }));
      expect(preview).toBe(published);
      expect(preview).toContain('<h1>Hello &lt;script&gt;</h1>');
      expect(preview).not.toContain('<script>');
    },
  );
});
