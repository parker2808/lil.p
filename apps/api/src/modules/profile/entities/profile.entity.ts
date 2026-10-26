import type { Prisma } from '../../../generated/prisma/client';

/** Columns we load. `phone` is selected only so the mapper can prove it drops it. */
export const profileSelect = {
  id: true,
  displayName: true,
  legalName: true,
  city: true,
  country: true,
  timezone: true,
  careerStartDate: true,
  headlineEn: true,
  headlineVi: true,
  subheadlineEn: true,
  subheadlineVi: true,
  bioEn: true,
  bioVi: true,
  languagesEn: true,
  languagesVi: true,
  heroKickerEn: true,
  heroKickerVi: true,
  headlineAccentEn: true,
  headlineAccentVi: true,
  avatarId: true,
  avatar: true,
  resumeEnId: true,
  resumeViId: true,
  resumeEn: true,
  resumeVi: true,
  phone: true,
  updatedAt: true,
} satisfies Prisma.ProfileSelect;

export type ProfileRow = Prisma.ProfileGetPayload<{ select: typeof profileSelect }>;
