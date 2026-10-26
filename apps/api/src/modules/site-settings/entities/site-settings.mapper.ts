import type { Locale, PublicSiteSettings } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { SiteSettingsRow } from './site-settings.entity';

const TRANSLATED = [
  'seoTitle',
  'seoDescription',
  'footerNote',
  'contactIntro',
  'replyTimeNote',
  'availabilityNote',
] as const;

export function toPublicSiteSettings(row: SiteSettingsRow, locale: Locale): PublicSiteSettings {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    siteName: row.siteName,
    domain: row.domain,
    defaultLocale: row.defaultLocale === 'vi' ? 'vi' : 'en',
    seoTitle: values.seoTitle ?? '',
    seoDescription: values.seoDescription ?? '',
    footerNote: values.footerNote ?? '',
    contactIntro: values.contactIntro ?? '',
    replyTimeNote: values.replyTimeNote ?? '',
    contactEmail: row.contactEmail,
    availability: row.availability,
    availabilityNote: values.availabilityNote ?? '',
    analyticsEnabled: row.analyticsEnabled,
    ambientEffects: row.ambientEffects,
    marqueeEnabled: row.marqueeEnabled,
    lang,
  };
}
