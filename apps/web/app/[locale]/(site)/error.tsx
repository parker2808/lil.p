'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@portfolio/ui/components/ui/button';
import { DemoError } from '@/modules/design-demo/DemoMore';
import { useDemoMode } from '@/modules/design-demo/DemoMode';
import { useLocale } from 'next-intl';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const locale = useLocale();
  const demoMode = useDemoMode();
  if (demoMode) return <DemoError locale={locale as 'en' | 'vi'} reset={reset} />;
  const requestId =
    'requestId' in error && typeof error.requestId === 'string' ? error.requestId : error.digest;

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-4 px-6 py-16">
      <h1 className="font-heading text-heading font-semibold">{t('error')}</h1>
      {requestId ? <p className="text-meta text-muted-foreground font-mono">{requestId}</p> : null}
      <Button type="button" onClick={reset}>
        {t('retry')}
      </Button>
    </div>
  );
}
