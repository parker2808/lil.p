'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@portfolio/ui/components/ui/button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const requestId =
    'requestId' in error && typeof error.requestId === 'string' ? error.requestId : error.digest;

  return (
    <main className="mx-auto flex min-h-dvh max-w-prose flex-col justify-center gap-4 px-6">
      <h1 className="font-heading text-heading font-semibold">{t('error')}</h1>
      {requestId ? <p className="text-meta text-muted-foreground font-mono">{requestId}</p> : null}
      <Button type="button" onClick={reset}>
        {t('retry')}
      </Button>
    </main>
  );
}
