import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export async function ProjectsIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BlocksPage pageKey="projects" locale={locale} searchParams={searchParams} />;
}
