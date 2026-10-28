'use client';

import { useLinkStatus } from 'next/link';
import { useTranslations } from 'next-intl';

/** Must live inside a Next Link; the framework owns cancellation and completion. */
export function RoutePending() {
  const { pending } = useLinkStatus();
  const t = useTranslations('core');
  return pending ? (
    <span className="route-pending" role="status">
      <span className="sr-only">{t('loading')}</span>
    </span>
  ) : null;
}
