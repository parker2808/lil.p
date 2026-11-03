'use client';

import { ArrowRight, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@portfolio/ui/components/ui/button';

export function PublicErrorState({
  error,
  reset,
  asMain = false,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  asMain?: boolean;
}) {
  const code = 500;
  const t = useTranslations('states');
  const nav = useTranslations('notFound');
  const locale = useLocale();
  const requestId =
    'requestId' in error && typeof error.requestId === 'string' ? error.requestId : error.digest;
  const content = (
    <>
      <title>{t('error')}</title>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-6 py-24 sm:py-32">
        <span aria-hidden="true" className="public-state-code">
          {code}
        </span>
        <p className="text-primary mt-3 font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          {t('error')}
        </p>
        <h1 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] font-semibold tracking-tight">
          {t('error')}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-prose text-base leading-relaxed">
          {t('errorDescription')}
        </p>
        {requestId ? (
          <p className="text-muted-foreground mt-4 font-mono text-xs">{requestId}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            surface="public"
            type="button"
            onClick={reset}
            className="public-error-retry min-h-11"
          >
            <RotateCcw aria-hidden="true" />
            {t('retry')}
          </Button>
          <Button surface="public" variant="outline" asChild className="min-h-11">
            <Link href={`/${locale}`}>
              {nav('home')} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );

  return asMain ? (
    <main id="content" className="min-h-dvh">
      {content}
    </main>
  ) : (
    content
  );
}
