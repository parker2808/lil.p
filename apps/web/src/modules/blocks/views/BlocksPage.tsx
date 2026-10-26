import type { Locale, PageKey } from '@portfolio/contracts';
import { getTranslations } from 'next-intl/server';

import { BlockRenderer } from '../components/BlockRenderer/BlockRenderer';
import { BLOCK_RENDERERS } from '../constants/block-renderers.constant';
import { getPage } from '../services/pages.service';

export async function BlocksPage({ pageKey, locale }: { pageKey: PageKey; locale: Locale }) {
  const page = await getPage(pageKey, locale);
  const t = await getTranslations('states');

  return (
    <BlockRenderer
      blocks={page.blocks}
      context={{ locale }}
      labels={{ error: t('error'), retry: t('retry'), empty: t('empty') }}
      registry={BLOCK_RENDERERS}
    />
  );
}
