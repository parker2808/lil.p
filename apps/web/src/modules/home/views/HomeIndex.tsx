import type { Locale } from '@portfolio/contracts';

import { getSite } from '@/modules/core/services/site.service';

/** Temporary home: name + headline from the API. T14 replaces this with blocks. */
export async function HomeIndex({ locale }: { locale: Locale }) {
  const site = await getSite(locale);

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <p className="text-meta text-muted-foreground" lang={site.profile.lang}>
        {site.profile.displayName}
      </p>
      <h1
        className="font-heading text-title mt-3 font-bold tracking-tight"
        lang={site.profile.lang}
      >
        {site.profile.headline}
      </h1>
    </main>
  );
}
