import type { Locale } from '@portfolio/contracts';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { DemoLoading } from '@/modules/design-demo/DemoLoading';
import { DemoEmpty } from '@/modules/design-demo/DemoMore';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; state: string }>;
}) {
  const { locale, state } = await params;
  const title =
    state === 'error'
      ? locale === 'vi'
        ? 'Lỗi'
        : 'Error'
      : state === 'empty'
        ? locale === 'vi'
          ? 'Chưa có nội dung'
          : 'Empty collection'
        : locale === 'vi'
          ? 'Đang tải'
          : 'Loading';
  return { title: `${title} — lil.parker` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; state: string }>;
}) {
  const { locale, state } = await params;
  setRequestLocale(locale);
  if (process.env.DESIGN_DEMO !== '1') notFound();
  if (state === 'error') return <DemoStatePreview locale={locale as Locale} />;
  if (state === 'empty') return <DemoEmpty locale={locale as Locale} />;
  if (variants.includes(state as (typeof variants)[number])) {
    return <DemoLoading variant={state as (typeof variants)[number]} />;
  }
  notFound();
}
