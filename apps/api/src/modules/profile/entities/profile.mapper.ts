import type { Locale, PublicProfile } from '@portfolio/contracts';

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
    lang,
  };
}
