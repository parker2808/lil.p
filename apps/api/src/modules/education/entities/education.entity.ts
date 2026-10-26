import type { Prisma } from '../../../generated/prisma/client';

export const educationSelect = {
  id: true,
  school: true,
  degreeEn: true,
  degreeVi: true,
  majorEn: true,
  majorVi: true,
  startDate: true,
  endDate: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.EducationSelect;

export type EducationRow = Prisma.EducationGetPayload<{ select: typeof educationSelect }>;
