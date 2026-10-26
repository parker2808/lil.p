'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

import { usePathname } from '@i18n/navigation';

export function PageViewBeacon({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!enabled || typeof navigator.sendBeacon !== 'function') {
      return;
    }
    const body = JSON.stringify({
      path: pathname || '/',
      locale,
      referrer: document.referrer || undefined,
    });
    navigator.sendBeacon('/api/public/views', new Blob([body], { type: 'application/json' }));
  }, [enabled, pathname, locale]);

  return null;
}
