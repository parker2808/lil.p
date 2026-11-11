import type { TreeDocument } from '@parker2808/cms-core/tree';
import { describe, expect, it } from 'vitest';

import { toTreePage } from './tree-page.util';

const tree = {
  schemaVersion: 1,
  root: { id: 'page-root', type: 'page', responsive: { base: {} }, sections: [] },
} as TreeDocument;

describe('tree page locale resolution', () => {
  it('keeps VI-only custom-page SEO in Vietnamese for preview and public', () => {
    expect(
      toTreePage(
        'ideas',
        'vi',
        {
          seoTitleEn: null,
          seoTitleVi: 'Ý tưởng',
          seoDescriptionEn: null,
          seoDescriptionVi: 'Mô tả',
        },
        tree,
      ).seo,
    ).toEqual({ title: 'Ý tưởng', description: 'Mô tả', lang: 'vi' });
  });
});
