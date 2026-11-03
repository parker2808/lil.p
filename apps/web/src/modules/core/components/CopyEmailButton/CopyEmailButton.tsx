'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@portfolio/ui/components/ui/button';
import { copyEmail } from '../../utils/copy-email.util';

export function CopyEmailButton({ email, showLink = true }: { email: string; showLink?: boolean }) {
  const t = useTranslations('core');
  const address = email.trim();
  if (!address) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        surface="public"
        type="button"
        className="min-h-11 min-w-11"
        onClick={async () => {
          if (await copyEmail(address)) toast.success(t('copied'));
          else toast.error(t('copyFailed'));
        }}
      >
        {t('copyEmail')}
      </Button>
      {showLink ? (
        <Button surface="public" variant="outline" className="min-h-11 min-w-11" asChild>
          <a href={`mailto:${address}`}>{t('emailLink')}</a>
        </Button>
      ) : null}
    </span>
  );
}
