import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';

export function ContactIndex({ locale }: { locale: Locale }) {
  return <BlocksPage pageKey="contact" locale={locale} />;
}
