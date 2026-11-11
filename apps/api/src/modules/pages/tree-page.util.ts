import type { TreeDocument } from '@parker2808/cms-core/tree';
import type { Locale, PageKey, PublicPage } from '@portfolio/contracts';

import { pickGroup } from '../../i18n/pick-locale.util';

export type TreePage = {
  key: PageKey;
  seo: PublicPage['seo'];
  tree: TreeDocument;
};

export function treeRoutesEnabled(): boolean {
  return process.env.CMS_TREE_ROUTES === '1';
}

export function toTreePage(
  key: PageKey,
  locale: Locale,
  seo: Record<string, unknown>,
  tree: TreeDocument,
): TreePage {
  if (
    locale === 'vi' &&
    typeof seo.seoTitleVi === 'string' &&
    seo.seoTitleVi.trim() &&
    !(typeof seo.seoTitleEn === 'string' && seo.seoTitleEn.trim())
  ) {
    return {
      key,
      seo: {
        title: seo.seoTitleVi,
        description:
          typeof seo.seoDescriptionVi === 'string' && seo.seoDescriptionVi.trim()
            ? seo.seoDescriptionVi
            : null,
        lang: 'vi',
      },
      tree,
    };
  }
  const { values, lang } = pickGroup(seo, ['seoTitle', 'seoDescription'] as const, locale);
  return {
    key,
    seo: { title: values.seoTitle, description: values.seoDescription, lang },
    tree,
  };
}
