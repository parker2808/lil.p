import { draftMode } from 'next/headers';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { getPage } from '../services/pages.service';
import { BlocksPage } from './BlocksPage';

vi.mock('next/headers', () => ({ draftMode: vi.fn() }));
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
