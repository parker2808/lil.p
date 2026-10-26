import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import type { ReactNode } from 'react';

import { getSite } from '@/modules/core/services/site.service';

import { DraftBanner } from '../DraftBanner/DraftBanner';
import { LocaleSuggestBanner } from '../LocaleSuggestBanner/LocaleSuggestBanner';
import { PreviewBridge } from '../PreviewBridge/PreviewBridge';
import { SiteFooter } from '../SiteFooter/SiteFooter';
import { SiteHeader } from '../SiteHeader/SiteHeader';
import { SkipLink } from '../SkipLink/SkipLink';

export async function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const site = await getSite(locale);
  const draft = await draftMode();

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      {draft.isEnabled ? <PreviewBridge /> : null}
      <DraftBanner />
      <LocaleSuggestBanner />
      <SiteHeader name={site.profile.displayName} nav={site.nav.header} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter
        name={site.profile.displayName}
        nav={site.nav.footer}
        social={site.socialLinks}
        buildSha={process.env.NEXT_PUBLIC_BUILD_SHA}
      />
    </div>
  );
}
