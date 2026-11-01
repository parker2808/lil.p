'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@i18n/navigation';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@portfolio/ui/components/ui/segmented-control';

const VI = 'VI';
const EN = 'EN';

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('core');

  return (
    <SegmentedControl asChild>
      <nav aria-label={t('locale')}>
        <SegmentedControlItem asChild>
          <Link
            href={pathname}
            locale="vi"
            hrefLang="vi"
            data-state={locale === 'vi' ? 'on' : 'off'}
            aria-current={locale === 'vi' ? 'true' : undefined}
          >
            {VI}
          </Link>
        </SegmentedControlItem>
        <SegmentedControlItem asChild>
          <Link
            href={pathname}
            locale="en"
            hrefLang="en"
            data-state={locale === 'en' ? 'on' : 'off'}
            aria-current={locale === 'en' ? 'true' : undefined}
          >
            {EN}
          </Link>
        </SegmentedControlItem>
      </nav>
    </SegmentedControl>
  );
}
