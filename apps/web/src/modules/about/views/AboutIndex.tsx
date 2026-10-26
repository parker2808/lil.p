import type { Locale } from '@portfolio/contracts';

import { BlocksPage } from '@/modules/blocks/views/BlocksPage';
import { getSite } from '@/modules/core/services/site.service';
import { JsonLd } from '@/modules/seo/components/JsonLd/JsonLd';
import { personJsonLd } from '@/modules/seo/utils/json-ld.util';

export async function AboutIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  let jsonLd: Record<string, unknown> | null = null;
  try {
    jsonLd = personJsonLd(await getSite(locale));
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <BlocksPage pageKey="about" locale={locale} searchParams={searchParams} />
    </>
  );
}
