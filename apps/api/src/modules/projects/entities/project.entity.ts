import type { Prisma } from '../../../generated/prisma/client';

export const projectMetricSelect = {
  id: true,
  labelEn: true,
  labelVi: true,
  before: true,
  after: true,
  value: true,
  sortOrder: true,
} satisfies Prisma.ProjectMetricSelect;

export const projectDomainSelect = {
  slug: true,
  nameEn: true,
  nameVi: true,
  hue: true,
  iconKey: true,
} satisfies Prisma.DomainSelect;

export const projectExperienceSelect = {
  id: true,
  company: true,
  roleEn: true,
  roleVi: true,
  startDate: true,
  endDate: true,
} satisfies Prisma.ExperienceSelect;

export const projectListInclude = {
  domain: { select: projectDomainSelect },
  experience: { select: projectExperienceSelect },
  metrics: { select: projectMetricSelect, orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.ProjectInclude;

export const projectSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleVi: true,
  taglineEn: true,
  taglineVi: true,
  client: true,
  roleEn: true,
  roleVi: true,
  teamSize: true,
  startDate: true,
  endDate: true,
  versionFrom: true,
  versionTo: true,
  isFeatured: true,
  isConfidential: true,
  liveUrl: true,
  repoUrl: true,
  problemEn: true,
  problemVi: true,
  constraintsEn: true,
  constraintsVi: true,
  approachEn: true,
  approachVi: true,
  decisionsEn: true,
  decisionsVi: true,
  outcomeEn: true,
  outcomeVi: true,
  lessonsEn: true,
  lessonsVi: true,
  keyFactsEn: true,
  keyFactsVi: true,
  factChipsEn: true,
  factChipsVi: true,
  seoTitleEn: true,
  seoTitleVi: true,
  seoDescriptionEn: true,
  seoDescriptionVi: true,
  sortOrder: true,
  status: true,
  publishedAt: true,
  domainId: true,
  experienceId: true,
  updatedAt: true,
  domain: { select: projectDomainSelect },
  experience: { select: projectExperienceSelect },
  metrics: { select: projectMetricSelect, orderBy: { sortOrder: 'asc' as const } },
  skills: {
    select: { id: true, name: true, slug: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.ProjectSelect;

export type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectSelect }>;
