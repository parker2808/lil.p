import {
  type AdminSiteSettings,
  type HeroStat,
  heroStatsSchema,
  type Locale,
  type PublicHeroStat,
  type PublicSiteSettings,
} from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import { toAdminMedia, toPublicImage } from '../../media/media.mapper';
import type { SiteSettingsRow } from './site-settings.entity';

const TRANSLATED = [
  'seoTitle',
  'seoDescription',
  'footerNote',
  'contactIntro',
  'replyTimeNote',
  'availabilityNote',
] as const;

/** Stored JSON that is missing, empty or no longer valid reads as `null` (use profile stats). */
export function parseHeroStats(value: unknown): HeroStat[] | null {
  const parsed = heroStatsSchema.safeParse(value);
  return parsed.success && parsed.data.length > 0 ? parsed.data : null;
}

export function toPublicHeroStats(value: unknown, locale: Locale): PublicHeroStat[] | null {
  return (
    parseHeroStats(value)?.map((stat) => ({
      value: stat.value,
      suffix: stat.suffix || null,
      label: locale === 'vi' ? stat.labelVi : stat.labelEn,
    })) ?? null
  );
}

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
    ogImage: toPublicImage(row.ogImage, locale),
    heroStats: toPublicHeroStats(row.heroStats, locale),
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
    ogImageId: row.ogImageId,
    ogImage: row.ogImage ? toAdminMedia(row.ogImage) : null,
    heroStats: parseHeroStats(row.heroStats),
    updatedAt: row.updatedAt.toISOString(),
  };
}
