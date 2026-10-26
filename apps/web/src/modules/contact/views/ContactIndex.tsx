import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export function ContactIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BlocksPage pageKey="contact" locale={locale} searchParams={searchParams} />;
}
