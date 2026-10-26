import type { Prisma } from '../../../generated/prisma/client';

export const experienceSelect = {
  id: true,
  company: true,
  companyUrl: true,
  location: true,
  employmentType: true,
  roleEn: true,
  roleVi: true,
  summaryEn: true,
  summaryVi: true,
  highlightsEn: true,
  highlightsVi: true,
  startDate: true,
  endDate: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
  skills: { select: { id: true } },
} satisfies Prisma.ExperienceSelect;

export type ExperienceRow = Prisma.ExperienceGetPayload<{ select: typeof experienceSelect }>;
