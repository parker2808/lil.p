import type { Locale, PublicEducation } from '@portfolio/contracts';

import { toIsoDate } from '../../../common/utils/iso-date.util';
import { pickGroup } from '../../../i18n/pick-locale.util';
import type { EducationRow } from './education.entity';

const TRANSLATED = ['degree', 'major'] as const;

export function toPublicEducation(row: EducationRow, locale: Locale): PublicEducation {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    id: row.id,
    school: row.school,
    degree: values.degree ?? '',
    major: values.major ?? '',
    startDate: toIsoDate(row.startDate),
    endDate: toIsoDate(row.endDate),
    lang,
  };
}
