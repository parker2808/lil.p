'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';

import { Link, usePathname } from '@i18n/navigation';

const COOKIE = 'locale-suggest-dismissed=1; path=/; max-age=31536000; samesite=lax';

function subscribe() {
  return () => undefined;
}

function preferredLocale() {
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function isDismissed() {
  return document.cookie.includes('locale-suggest-dismissed=1');
}

export function LocaleSuggestBanner() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('core');
  const preferred = useSyncExternalStore(subscribe, preferredLocale, () => locale);
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  const [hidden, setHidden] = useState(false);

  if (hidden || dismissed || preferred === locale) {
    return null;
  }

  const other = locale === 'en' ? 'vi' : 'en';

  return (
    <aside
      aria-label={t('locale')}
      className="bg-primary-subtle text-primary-subtle-foreground text-ui flex items-center justify-center gap-4 px-6 py-2"
    >
      <Link href={pathname} locale={other}>
        {t('switchLocale')}
      </Link>
      <button
        type="button"
        className="text-meta underline-offset-2 hover:underline"
        onClick={() => {
          document.cookie = COOKIE;
          setHidden(true);
        }}
      >
        {t('close')}
      </button>
    </aside>
  );
}
