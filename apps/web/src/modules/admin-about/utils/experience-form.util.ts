import type { AdminExperience, ExperienceCreateInput } from '@portfolio/contracts';

export type ExperienceFormValues = ExperienceCreateInput & {
  id?: number;
  updatedAt?: string;
};

export function emptyExperienceForm(): ExperienceFormValues {
  return {
    company: '',
    companyUrl: null,
    location: '',
    employmentType: 'FULL_TIME',
    roleEn: '',
    roleVi: '',
    summaryEn: '',
    summaryVi: '',
    highlightsEn: '',
    highlightsVi: '',
    startDate: new Date().toISOString().slice(0, 7),
    endDate: null,
    isVisible: true,
    skillIds: [],
  };
}

export function experienceToForm(row: AdminExperience): ExperienceFormValues {
  return {
    id: row.id,
    updatedAt: row.updatedAt,
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
    startDate: row.startDate.slice(0, 7),
    endDate: row.endDate?.slice(0, 7) ?? null,
    isVisible: row.isVisible,
    skillIds: row.skillIds,
  };
}

export function toExperienceCreateInput(values: ExperienceFormValues): ExperienceCreateInput {
  return {
    company: values.company,
    companyUrl: values.companyUrl,
    location: values.location,
    employmentType: values.employmentType,
    roleEn: values.roleEn,
    roleVi: values.roleVi,
    summaryEn: values.summaryEn,
    summaryVi: values.summaryVi,
    highlightsEn: values.highlightsEn,
    highlightsVi: values.highlightsVi,
    startDate: values.startDate,
    endDate: values.endDate,
    isVisible: values.isVisible,
    skillIds: values.skillIds,
  };
}
