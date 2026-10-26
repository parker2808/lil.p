'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@i18n/navigation';
import { ToggleGroup, ToggleGroupItem } from '@portfolio/ui/components/ui/toggle-group';

const VI = 'VI';
const EN = 'EN';

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('core');

  return (
    <ToggleGroup type="single" value={locale} aria-label={t('locale')}>
      <ToggleGroupItem value="vi" asChild>
        <Link href={pathname} locale="vi" hrefLang="vi">
          {VI}
        </Link>
      </ToggleGroupItem>
      <ToggleGroupItem value="en" asChild>
        <Link href={pathname} locale="en" hrefLang="en">
          {EN}
        </Link>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
