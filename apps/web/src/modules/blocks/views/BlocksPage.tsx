import type { Locale, PageKey, PublicPagePreview } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { BlockRenderer } from '../components/BlockRenderer/BlockRenderer';
import { BLOCK_RENDERERS } from '../constants/block-renderers.constant';
import { getPage } from '../services/pages.service';

function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function BlocksPage({
  pageKey,
  locale,
  searchParams,
}: {
  pageKey: PageKey;
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const rawVersion = firstQuery(searchParams?.v);
  const version = rawVersion ? Number(rawVersion) : undefined;
  const page = await getPage(
    pageKey,
    locale,
    version !== undefined && Number.isInteger(version) && version > 0 ? version : undefined,
  );
  const draft = await draftMode();
  const t = await getTranslations('states');
  const preview = page as PublicPagePreview;

  return (
    <BlockRenderer
      blocks={page.blocks}
      invalidBlocks={'invalidBlocks' in preview ? preview.invalidBlocks : []}
      draft={draft.isEnabled}
      context={{ locale, searchParams }}
      labels={{ error: t('error'), retry: t('retry'), empty: t('empty'), unknown: t('empty') }}
      registry={BLOCK_RENDERERS}
    />
  );
}
