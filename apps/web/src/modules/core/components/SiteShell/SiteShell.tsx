import type { Locale } from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import type { ReactNode } from 'react';

import { getSite } from '@/modules/core/services/site.service';

import { DraftBanner } from '../DraftBanner/DraftBanner';
import { PageViewBeacon } from '../PageViewBeacon/PageViewBeacon';
import { LocaleSuggestBanner } from '../LocaleSuggestBanner/LocaleSuggestBanner';
import { PreviewBridge } from '../PreviewBridge/PreviewBridge';
import { SiteFooter } from '../SiteFooter/SiteFooter';
import { SiteHeader } from '../SiteHeader/SiteHeader';
import { SkipLink } from '../SkipLink/SkipLink';

export async function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const site = await getSite(locale);
  const draft = await draftMode();

  return (
    <div className="public-site flex min-h-dvh flex-col">
      <PageViewBeacon enabled={site.settings.analyticsEnabled} />
      <SkipLink />
      {draft.isEnabled ? <PreviewBridge /> : null}
      <DraftBanner />
      <LocaleSuggestBanner />
      <SiteHeader
        name={site.profile.displayName}
        nav={site.nav.header}
        resumeUrl={site.profile.resume?.url}
      />
      <main id="content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter
        name={site.profile.displayName}
        nav={site.nav}
        social={site.socialLinks}
        updatedAt={new Date()}
        buildSha={process.env.NEXT_PUBLIC_BUILD_SHA}
      />
    </div>
  );
}
