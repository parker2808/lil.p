import type { Locale } from '@portfolio/contracts';
import { setRequestLocale } from 'next-intl/server';

import { NotesIndex } from '@/modules/notes/views/NotesIndex';
import { DemoNotes } from '@/modules/design-demo/DemoMore';
import { buildNotesMetadata } from '@/modules/seo/utils/notes-metadata.util';

// Filters live in searchParams, so render per request. Declared, not inferred: with the API
// down at build Next never renders this page and would call it static. Public fetches set
// their own `revalidate`, so they still hit the data cache.
export const dynamic = 'force-dynamic';

export const generateMetadata =
  process.env.DESIGN_DEMO === '1'
    ? async () => ({ title: 'Notes — lil.parker' })
    : buildNotesMetadata;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO === '1') return <DemoNotes locale={locale as Locale} />;
  const query = await searchParams;
  return <NotesIndex locale={locale as Locale} searchParams={query} />;
}
