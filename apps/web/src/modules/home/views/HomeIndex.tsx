import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export async function HomeIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BlocksPage pageKey="home" locale={locale} searchParams={searchParams} />;
}
