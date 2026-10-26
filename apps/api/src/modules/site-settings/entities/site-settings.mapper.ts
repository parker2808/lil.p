import type { AdminSiteSettings, Locale, PublicSiteSettings } from '@portfolio/contracts';

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

export function toAdminDto(row: SiteSettingsRow): AdminSiteSettings {
  return {
    id: 1,
    siteName: row.siteName,
    domain: row.domain,
    defaultLocale: row.defaultLocale === 'vi' ? 'vi' : 'en',
    seoTitleEn: row.seoTitleEn,
    seoTitleVi: row.seoTitleVi,
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionVi: row.seoDescriptionVi,
    footerNoteEn: row.footerNoteEn,
    footerNoteVi: row.footerNoteVi,
    contactIntroEn: row.contactIntroEn,
    contactIntroVi: row.contactIntroVi,
    replyTimeNoteEn: row.replyTimeNoteEn,
    replyTimeNoteVi: row.replyTimeNoteVi,
    contactEmail: row.contactEmail,
    availability: row.availability,
    availabilityNoteEn: row.availabilityNoteEn,
    availabilityNoteVi: row.availabilityNoteVi,
    analyticsEnabled: row.analyticsEnabled,
    ambientEffects: row.ambientEffects,
    marqueeEnabled: row.marqueeEnabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}
