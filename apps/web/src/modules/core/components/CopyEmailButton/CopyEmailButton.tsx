'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@portfolio/ui/components/ui/button';

export function CopyEmailButton({ email }: { email: string }) {
  const t = useTranslations('core');

  return (
    <Button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(email);
        toast.success(t('copied'));
      }}
    >
      {t('copyEmail')}
    </Button>
  );
}
