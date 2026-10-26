import type {
  AdminProject,
  AdminProjectListItem,
  Locale,
  PublicProjectDetail,
  PublicProjectDomain,
  PublicProjectExperience,
  PublicProjectListItem,
  PublicProjectMetric,
} from '@portfolio/contracts';

import { toIsoDate } from '../../../common/utils/iso-date.util';
import { pickGroup } from '../../../i18n/pick-locale.util';
import type { ProjectRow } from './project.entity';

const LIST_TEXT = ['title', 'tagline', 'factChips'] as const;
const DETAIL_TEXT = [
  'title',
  'tagline',
  'role',
  'problem',
  'constraints',
  'approach',
  'decisions',
  'outcome',
  'lessons',
  'keyFacts',
  'factChips',
  'seoTitle',
  'seoDescription',
] as const;

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitChips(value: string): string[] {
  return value
    .split(',')
    .map((chip) => chip.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function toMetric(row: ProjectRow['metrics'][number], locale: Locale): PublicProjectMetric {
  const { values, lang } = pickGroup(row, ['label'] as const, locale);
  return {
    id: row.id,
    label: values.label ?? '',
    before: row.before,
    after: row.after,
    value: row.value,
    lang,
  };
}

function toDomain(row: NonNullable<ProjectRow['domain']>, locale: Locale): PublicProjectDomain {
  const { values, lang } = pickGroup(row, ['name'] as const, locale);
  return {
    slug: row.slug,
    name: values.name ?? '',
    hue: row.hue,
    iconKey: row.iconKey as PublicProjectDomain['iconKey'],
    lang,
  };
}

function toExperience(
  row: NonNullable<ProjectRow['experience']>,
  locale: Locale,
): PublicProjectExperience {
  const { values, lang } = pickGroup(row, ['role'] as const, locale);
  return {
    id: row.id,
    company: row.company,
    role: values.role ?? '',
    startDate: toIsoDate(row.startDate),
    endDate: row.endDate ? toIsoDate(row.endDate) : null,
    lang,
  };
}

function toListBase(row: ProjectRow, locale: Locale): PublicProjectListItem {
  const { values, lang } = pickGroup(row, LIST_TEXT, locale);
  const metrics = row.metrics.map((metric) => toMetric(metric, locale));

  return {
    id: row.id,
    slug: row.slug,
    title: values.title ?? '',
    tagline: values.tagline ?? '',
    client: row.client,
    isFeatured: row.isFeatured,
    isConfidential: row.isConfidential,
    startDate: toIsoDate(row.startDate),
    endDate: row.endDate ? toIsoDate(row.endDate) : null,
    versionFrom: row.versionFrom,
    versionTo: row.versionTo,
    domain: row.domain ? toDomain(row.domain, locale) : null,
    topMetric: metrics[0] ?? null,
    factChips: splitChips(values.factChips ?? ''),
    skills: row.skills.map((skill) => ({ name: skill.name, slug: skill.slug })),
    lang,
  };
}

export function toPublicProjectListItem(row: ProjectRow, locale: Locale): PublicProjectListItem {
  return toListBase(row, locale);
}

export function toPublicProjectDetail(row: ProjectRow, locale: Locale): PublicProjectDetail {
  const { values, lang } = pickGroup(row, DETAIL_TEXT, locale);
  const base = toListBase(row, locale);
  const hideLinks = row.isConfidential;

  return {
    ...base,
    lang,
    role: values.role ?? '',
    teamSize: row.teamSize,
    liveUrl: hideLinks ? null : row.liveUrl,
    repoUrl: hideLinks ? null : row.repoUrl,
    problem: values.problem ?? '',
    constraints: values.constraints ?? '',
    approach: values.approach ?? '',
    decisions: values.decisions ?? '',
    outcome: values.outcome ?? '',
    lessons: values.lessons ?? '',
    keyFacts: splitLines(values.keyFacts ?? ''),
    factChips: splitChips(values.factChips ?? ''),
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
    metrics: row.metrics.map((metric) => toMetric(metric, locale)),
    experience: row.experience ? toExperience(row.experience, locale) : null,
  };
}

export function toAdminDto(row: ProjectRow): AdminProject {
  return {
    id: row.id,
    slug: row.slug,
    titleEn: row.titleEn,
    titleVi: row.titleVi,
    taglineEn: row.taglineEn,
    taglineVi: row.taglineVi,
    client: row.client,
    roleEn: row.roleEn,
    roleVi: row.roleVi,
    teamSize: row.teamSize,
    startDate: toIsoDate(row.startDate),
    endDate: row.endDate ? toIsoDate(row.endDate) : null,
    versionFrom: row.versionFrom,
    versionTo: row.versionTo,
    isFeatured: row.isFeatured,
    isConfidential: row.isConfidential,
    liveUrl: row.liveUrl,
    repoUrl: row.repoUrl,
    problemEn: row.problemEn,
    problemVi: row.problemVi,
    constraintsEn: row.constraintsEn,
    constraintsVi: row.constraintsVi,
    approachEn: row.approachEn,
    approachVi: row.approachVi,
    decisionsEn: row.decisionsEn,
    decisionsVi: row.decisionsVi,
    outcomeEn: row.outcomeEn,
    outcomeVi: row.outcomeVi,
    lessonsEn: row.lessonsEn,
    lessonsVi: row.lessonsVi,
    keyFactsEn: row.keyFactsEn,
    keyFactsVi: row.keyFactsVi,
    factChipsEn: row.factChipsEn,
    factChipsVi: row.factChipsVi,
    seoTitleEn: row.seoTitleEn,
    seoTitleVi: row.seoTitleVi,
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionVi: row.seoDescriptionVi,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    sortOrder: row.sortOrder,
    domainId: row.domainId,
    experienceId: row.experienceId,
    skillIds: row.skills.map((skill) => skill.id),
    metrics: row.metrics.map((metric) => ({
      id: metric.id,
      labelEn: metric.labelEn,
      labelVi: metric.labelVi,
      before: metric.before,
      after: metric.after,
      value: metric.value,
      sortOrder: metric.sortOrder,
    })),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAdminListItem(row: ProjectRow): AdminProjectListItem {
  const full = toAdminDto(row);
  return {
    id: full.id,
    slug: full.slug,
    titleEn: full.titleEn,
    titleVi: full.titleVi,
    status: full.status,
    isFeatured: full.isFeatured,
    domainId: full.domainId,
    updatedAt: full.updatedAt,
  };
}
