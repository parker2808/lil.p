import type { Locale } from '@portfolio/contracts';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { DemoLoading } from '@/modules/design-demo/DemoLoading';
import { DemoStatePreview } from '@/modules/design-demo/DemoStatePreview';

const variants = [
  'home',
  'projects',
  'detail',
  'craft',
  'notes',
  'note',
  'about',
  'contact',
] as const;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; state: string }>;
}) {
  const { locale, state } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO !== '1') notFound();
  if (state === 'error') return <DemoStatePreview locale={locale as Locale} />;
  if (variants.includes(state as (typeof variants)[number])) {
    return <DemoLoading variant={state as (typeof variants)[number]} />;
  }
  notFound();
}
