import type { AdminEducation, Locale, PublicEducation } from '@portfolio/contracts';

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

export function toAdminDto(row: EducationRow): AdminEducation {
  return {
    id: row.id,
    school: row.school,
    degreeEn: row.degreeEn,
    degreeVi: row.degreeVi,
    majorEn: row.majorEn,
    majorVi: row.majorVi,
    startDate: toIsoDate(row.startDate),
    endDate: toIsoDate(row.endDate),
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}
