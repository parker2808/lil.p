'use client';

import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminBack } from '../../hooks/use-admin-back.hook';

export function AdminLoadError({
  navKey,
  message,
  onRetry,
}: {
  navKey: string;
  message: string;
  onRetry: () => void;
}) {
  const t = useTranslations('admin.shell');
  const back = useAdminBack(navKey);
  return (
    <ErrorState
      message={message}
      retryLabel={t('retry')}
      onRetry={onRetry}
      back={back}
      linkComponent={Link}
    />
  );
}
