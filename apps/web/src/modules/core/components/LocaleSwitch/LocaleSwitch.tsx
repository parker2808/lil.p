'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@i18n/navigation';
import { cn } from '@portfolio/ui/lib/utils';

const VI = 'VI';
const EN = 'EN';

const itemClass =
  'text-ui inline-flex h-8 items-center px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground';

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('core');

  return (
    <nav className="inline-flex rounded-md border" aria-label={t('locale')}>
      <Link
        href={pathname}
        locale="vi"
        hrefLang="vi"
        data-state={locale === 'vi' ? 'on' : 'off'}
        aria-current={locale === 'vi' ? 'true' : undefined}
        className={cn(itemClass)}
      >
        {VI}
      </Link>
      <Link
        href={pathname}
        locale="en"
        hrefLang="en"
        data-state={locale === 'en' ? 'on' : 'off'}
        aria-current={locale === 'en' ? 'true' : undefined}
        className={cn(itemClass)}
      >
        {EN}
      </Link>
    </nav>
  );
}
