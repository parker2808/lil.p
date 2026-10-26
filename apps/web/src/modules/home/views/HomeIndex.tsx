import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export async function HomeIndex({ locale }: { locale: Locale }) {
  return <BlocksPage pageKey="home" locale={locale} />;
}
