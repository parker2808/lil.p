import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { PaletteSearchField } from '@/modules/core/components/CommandPalette/PaletteSearchField';

export default async function NotFound() {
  const t = await getTranslations('states');
  const nav = await getTranslations('notFound');
  const locale = await getLocale();
  return (
    <div className="mx-auto flex max-w-prose flex-col gap-4 px-6 py-16">
      <h1 className="font-heading text-heading font-semibold">{t('notFound')}</h1>
      <p className="text-muted-foreground">{nav('description')}</p>
      <PaletteSearchField />
      <nav aria-label={nav('linksLabel')} className="flex flex-wrap gap-4">
        <Link href={`/${locale}`}>{nav('home')}</Link>
        <Link href={`/${locale}/projects`}>{nav('projects')}</Link>
        <Link href={`/${locale}/contact`}>{nav('contact')}</Link>
      </nav>
    </div>
  );
}
