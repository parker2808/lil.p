import {
  type AdminProfile,
  type Locale,
  MARKDOWN_IMAGE_PREFIX,
  type PublicProfile,
} from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import { toAdminMedia, toPublicImage } from '../../media/media.mapper';
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
    avatar: toPublicImage(row.avatar, locale),
    resume: (() => {
      const media = locale === 'vi' && row.resumeVi ? row.resumeVi : row.resumeEn;
      return media ? { url: `${MARKDOWN_IMAGE_PREFIX}${media.fileName}` } : null;
    })(),
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
    avatarId: row.avatarId,
    avatar: row.avatar ? toAdminMedia(row.avatar) : null,
    resumeEnId: row.resumeEnId,
    resumeViId: row.resumeViId,
    resumeEn: row.resumeEn ? toAdminMedia(row.resumeEn) : null,
    resumeVi: row.resumeVi ? toAdminMedia(row.resumeVi) : null,
    phone: row.phone,
    updatedAt: row.updatedAt.toISOString(),
  };
}
