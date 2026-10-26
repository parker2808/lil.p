import type { AdminProfile, Locale, PublicProfile } from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ProfileRow } from './profile.entity';

const TRANSLATED = [
  'headline',
  'subheadline',
  'bio',
  'languages',
  'heroKicker',
  'headlineAccent',
] as const;

export function toPublicProfile(row: ProfileRow, locale: Locale): PublicProfile {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    displayName: row.displayName,
    legalName: row.legalName,
    city: row.city,
    country: row.country,
    timezone: row.timezone,
    careerStartDate: row.careerStartDate.toISOString().slice(0, 10),
    headline: values.headline ?? '',
    subheadline: values.subheadline ?? '',
    bio: values.bio ?? '',
    languages: values.languages ?? '',
    heroKicker: values.heroKicker,
    headlineAccent: values.headlineAccent,
    resumeEnId: row.resumeEnId,
    resumeViId: row.resumeViId,
    lang,
  };
}

export function toAdminDto(row: ProfileRow): AdminProfile {
  return {
    id: 1,
    displayName: row.displayName,
    legalName: row.legalName,
    city: row.city,
    country: row.country,
    timezone: row.timezone,
    careerStartDate: row.careerStartDate.toISOString().slice(0, 10),
    headlineEn: row.headlineEn,
    headlineVi: row.headlineVi,
    subheadlineEn: row.subheadlineEn,
    subheadlineVi: row.subheadlineVi,
    bioEn: row.bioEn,
    bioVi: row.bioVi,
    languagesEn: row.languagesEn,
    languagesVi: row.languagesVi,
    heroKickerEn: row.heroKickerEn,
    heroKickerVi: row.heroKickerVi,
    headlineAccentEn: row.headlineAccentEn,
    headlineAccentVi: row.headlineAccentVi,
    resumeEnId: row.resumeEnId,
    resumeViId: row.resumeViId,
    phone: row.phone,
    updatedAt: row.updatedAt.toISOString(),
  };
}
