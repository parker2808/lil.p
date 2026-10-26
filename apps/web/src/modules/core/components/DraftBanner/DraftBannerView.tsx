'use client';

import { buttonVariants } from '@portfolio/ui/components/ui/button';
import { cn } from '@portfolio/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function DraftBannerView({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('draft');
  const pathname = usePathname();
  const exitHref = `/api/draft?exit=1&path=${encodeURIComponent(pathname)}`;
  const loginHref = `/admin/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div
      data-slot="draft-banner"
      className="bg-warning-subtle text-foreground flex flex-wrap items-center justify-between gap-3 px-6 py-2"
    >
      <p className="text-ui">{t('banner')}</p>
      <div className="flex items-center gap-2">
        {signedIn ? null : (
          <Link href={loginHref} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
            {t('login')}
          </Link>
        )}
        <a href={exitHref} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
          {t('exit')}
        </a>
      </div>
    </div>
  );
}
