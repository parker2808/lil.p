import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { ContactIndex } from '@/modules/contact/views/ContactIndex';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactIndex locale={locale as Locale} />;
}
