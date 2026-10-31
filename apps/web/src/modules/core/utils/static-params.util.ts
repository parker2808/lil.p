import { routing } from '@i18n/routing';

import { isApiReachable } from '../services/api-server.service';

/** Locales to prerender at build; none when the API is down, so ISR renders them on first visit. */
export async function localeStaticParams(): Promise<{ locale: string }[]> {
  return (await isApiReachable()) ? routing.locales.map((locale) => ({ locale })) : [];
}

/** Locale × slug pairs for routes that do not inherit params from the locale layout. */
export async function localeSlugStaticParams(
  listSlugs: () => Promise<string[]>,
): Promise<{ locale: string; slug: string }[]> {
  const locales = await localeStaticParams();
  if (locales.length === 0) {
    return [];
  }
  const slugs = await listSlugs();
  return locales.flatMap(({ locale }) => slugs.map((slug) => ({ locale, slug })));
}
