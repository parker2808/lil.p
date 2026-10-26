import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export async function NotesIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BlocksPage pageKey="notes" locale={locale} searchParams={searchParams} />;
}
