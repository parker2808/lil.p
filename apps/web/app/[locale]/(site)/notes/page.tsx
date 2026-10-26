import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { NotesIndex } from '@/modules/notes/views/NotesIndex';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  return <NotesIndex locale={locale as Locale} searchParams={query} />;
}
