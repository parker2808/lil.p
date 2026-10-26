import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export async function AboutIndex({ locale }: { locale: Locale }) {
  return <BlocksPage pageKey="about" locale={locale} />;
}
