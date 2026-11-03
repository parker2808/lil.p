import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@portfolio/ui/components/ui/button';

import { PaletteSearchField } from '@/modules/core/components/CommandPalette/PaletteSearchField';

export default async function NotFound() {
  const code = 404;
  const t = await getTranslations('states');
  const nav = await getTranslations('notFound');
  const locale = await getLocale();
  return (
    <div className="public-missing mx-auto flex w-full max-w-2xl flex-col items-start px-6 py-24 sm:py-32">
      <span className="public-state-code" aria-hidden="true">
        {code}
      </span>
      <p className="text-primary mt-3 font-mono text-xs font-semibold tracking-[0.18em] uppercase">
        {t('notFound')}
      </p>
      <h1 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] font-semibold tracking-tight">
        {t('notFound')}
      </h1>
      <p className="text-muted-foreground mt-5 max-w-prose text-base leading-relaxed">
        {nav('description')}
      </p>
      <div className="mt-8 w-full max-w-md">
        <PaletteSearchField />
      </div>
      <nav aria-label={nav('linksLabel')} className="mt-8 flex flex-wrap items-center gap-3">
        <Button surface="public" asChild className="min-h-11">
          <Link href={`/${locale}`}>
            {nav('home')} <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button surface="public" variant="outline" asChild className="min-h-11">
          <Link href={`/${locale}/projects`}>{nav('projects')}</Link>
        </Button>
        <Button surface="public" variant="outline" asChild className="min-h-11">
          <Link href={`/${locale}/contact`}>{nav('contact')}</Link>
        </Button>
      </nav>
    </div>
  );
}
