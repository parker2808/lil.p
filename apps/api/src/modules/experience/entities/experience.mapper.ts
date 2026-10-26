import type { AdminExperience, Locale, PublicExperience } from '@portfolio/contracts';

import { toIsoDate } from '../../../common/utils/iso-date.util';
import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ExperienceRow } from './experience.entity';

const TRANSLATED = ['role', 'summary', 'highlights'] as const;

export function toPublicExperience(row: ExperienceRow, locale: Locale): PublicExperience {
  const { values, lang } = pickGroup(row, TRANSLATED, locale);

  return {
    id: row.id,
    company: row.company,
    companyUrl: row.companyUrl,
    location: row.location,
    employmentType: row.employmentType,
    role: values.role ?? '',
    summary: values.summary ?? '',
    highlights: values.highlights ?? '',
    startDate: toIsoDate(row.startDate),
    endDate: row.endDate ? toIsoDate(row.endDate) : null,
    lang,
  };
}

export function toAdminDto(row: ExperienceRow): AdminExperience {
  return {
    id: row.id,
    company: row.company,
    companyUrl: row.companyUrl,
    location: row.location,
    employmentType: row.employmentType,
    roleEn: row.roleEn,
    roleVi: row.roleVi,
    summaryEn: row.summaryEn,
    summaryVi: row.summaryVi,
    highlightsEn: row.highlightsEn,
    highlightsVi: row.highlightsVi,
    startDate: toIsoDate(row.startDate),
    endDate: row.endDate ? toIsoDate(row.endDate) : null,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    skillIds: row.skills.map((skill) => skill.id),
    updatedAt: row.updatedAt.toISOString(),
  };
}
