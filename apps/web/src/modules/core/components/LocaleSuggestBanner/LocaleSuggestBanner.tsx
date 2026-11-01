'use client';

import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';

import { Link, usePathname } from '@i18n/navigation';
import { Button } from '@portfolio/ui/components/ui/button';

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

/** Small toast suggesting the visitor's browser language; any choice is remembered for a year. */
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
  const remember = () => {
    document.cookie = COOKIE;
    setHidden(true);
  };

  return (
    <aside aria-label={t('locale')} className="locale-toast text-ui">
      <Link
        href={pathname}
        locale={other}
        className="tap flex-1 font-medium underline-offset-2 hover:underline"
        onClick={remember}
      >
        {t('switchLocale')}
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 shrink-0 p-0"
        aria-label={t('close')}
        onClick={remember}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </aside>
  );
}
