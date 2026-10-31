import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type {
  Availability,
  ContentStatus,
  EmploymentType,
  Hue,
  SkillDepth,
  StatSource,
} from '../../../src/generated/prisma/client';

/**
 * Owner portfolio JSON → Prisma write shapes.
 *
 * Rules: copy source strings exactly. Never invent numbers or text.
 * Month-only dates (`YYYY-MM`) become the first day of that month so they
 * fit `@db.Date`. `availability` is an enum, so the raw TODO stays in the
 * unmapped note and the row uses the schema default `OPEN`.
 */

function dataFile(name: string): string {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, 'prisma/seed/data', name),
    resolve(cwd, 'dist', name),
    resolve(cwd, name),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error(`${name} was not found next to the seed`);
  }
  return found;
}

export const SITE_AVAILABILITY_FALLBACK = 'OPEN' satisfies Availability;

export type PortfolioReleaseStatus = {
  released: string[];
  notReleased: string[];
};

type LocalizedPair = { titleEn: string | null; titleVi: string | null };

export type PortfolioJson = {
  _meta: unknown;
  siteSettings: Record<string, unknown>;
  profile: Record<string, unknown>;
  navItems: Record<string, unknown>[];
  socialLinks: Record<string, unknown>[];
  pageSections: (LocalizedPair & {
    page: string;
    key: string;
    sortOrder: number;
    isVisible: boolean;
  })[];
  profileStats: Record<string, unknown>[];
  domains: Record<string, unknown>[];
  skillCategories: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  _skillsNote?: string;
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  principles: Record<string, unknown>[];
  _principlesNote?: string;
  processSteps: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  posts: unknown[];
  tags: unknown[];
  _postsNote?: string;
  contactTopics: Record<string, unknown>[];
  gaps: string[];
};

export function loadPortfolioData(): PortfolioJson {
  return JSON.parse(readFileSync(dataFile('portfolio-data.json'), 'utf8')) as PortfolioJson;
}

/** `2026-07` → 2026-07-01 UTC. Full dates pass through. */
export function parseMonthDate(value: string | null | undefined): Date | null {
  if (value == null || value === '') {
    return null;
  }
  if (/^\d{4}-\d{2}$/.test(value)) {
    return new Date(`${value}-01T00:00:00.000Z`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

export function slugifyLabel(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function optionalInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function bool(value: unknown, fallback = true): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function int(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function mapSiteSettings(data: PortfolioJson) {
  const row = data.siteSettings;
  return {
    siteName: text(row.siteName),
    domain: text(row.domain),
    defaultLocale: text(row.defaultLocale, 'en'),
    seoTitleEn: text(row.seoTitleEn),
    seoTitleVi: text(row.seoTitleVi),
    seoDescriptionEn: text(row.seoDescriptionEn),
    seoDescriptionVi: text(row.seoDescriptionVi),
    ogImageId: optionalInt(row.ogImageId),
    footerNoteEn: text(row.footerNoteEn),
    footerNoteVi: text(row.footerNoteVi),
    contactIntroEn: text(row.contactIntroEn),
    contactIntroVi: text(row.contactIntroVi),
    replyTimeNoteEn: text(row.replyTimeNoteEn),
    replyTimeNoteVi: text(row.replyTimeNoteVi),
    contactEmail: text(row.contactEmail, '<email>'),
    availability: SITE_AVAILABILITY_FALLBACK,
    availabilityNoteEn: text(row.availabilityNoteEn),
    availabilityNoteVi: text(row.availabilityNoteVi),
    analyticsEnabled: bool(row.analyticsEnabled, false),
    ambientEffects: bool(row.ambientEffects, true),
    marqueeEnabled: bool(row.marqueeEnabled, true),
  };
}

export function mapProfile(data: PortfolioJson) {
  const row = data.profile;
  const careerStartDate = parseMonthDate(text(row.careerStartDate));
  if (!careerStartDate) {
    throw new Error('profile.careerStartDate is required');
  }
  return {
    displayName: text(row.displayName),
    legalName: text(row.legalName),
    city: text(row.city),
    country: text(row.country),
    timezone: text(row.timezone),
    careerStartDate,
    headlineEn: text(row.headlineEn),
    headlineVi: text(row.headlineVi),
    subheadlineEn: text(row.subheadlineEn),
    subheadlineVi: text(row.subheadlineVi),
    bioEn: text(row.bioEn),
    bioVi: text(row.bioVi),
    languagesEn: text(row.languagesEn),
    languagesVi: text(row.languagesVi),
    heroKickerEn: optionalText(row.heroKickerEn),
    heroKickerVi: optionalText(row.heroKickerVi),
    headlineAccentEn: optionalText(row.headlineAccentEn),
    headlineAccentVi: optionalText(row.headlineAccentVi),
    avatarId: optionalInt(row.avatarId),
    resumeEnId: optionalInt(row.resumeEnId),
    resumeViId: optionalInt(row.resumeViId),
    phone: text(row.phone, '<phone>'),
  };
}

export function mapNavItems(data: PortfolioJson) {
  return data.navItems.map((row) => ({
    location: text(row.location) as 'HEADER' | 'FOOTER',
    labelEn: text(row.labelEn),
    labelVi: text(row.labelVi),
    href: text(row.href),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapSocialLinks(data: PortfolioJson) {
  return data.socialLinks.map((row) => ({
    kind: text(row.kind) as 'GITHUB' | 'LINKEDIN' | 'EMAIL' | 'RSS' | 'OTHER',
    labelEn: text(row.labelEn),
    labelVi: text(row.labelVi),
    url: text(row.url),
    showInHeader: bool(row.showInHeader, false),
    showInCta: bool(row.showInCta, false),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapContactTopics(data: PortfolioJson) {
  return data.contactTopics.map((row) => ({
    slug: slugifyLabel(text(row.labelEn)),
    labelEn: text(row.labelEn),
    labelVi: text(row.labelVi),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapSkillCategories(data: PortfolioJson) {
  return data.skillCategories.map((row) => ({
    slug: text(row.slug),
    nameEn: text(row.nameEn),
    nameVi: text(row.nameVi),
    sortOrder: int(row.sortOrder),
  }));
}

export function mapSkills(data: PortfolioJson) {
  return data.skills.map((row) => ({
    name: text(row.name),
    slug: text(row.slug),
    category: text(row.category),
    depth: text(row.depth) as SkillDepth,
    showInMarquee: bool(row.showInMarquee, false),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapExperience(data: PortfolioJson) {
  return data.experience.map((row) => {
    const startDate = parseMonthDate(text(row.startDate));
    if (!startDate) {
      throw new Error(`experience ${String(row.key)} is missing startDate`);
    }
    return {
      key: text(row.key),
      company: text(row.company),
      companyUrl: optionalText(row.companyUrl),
      location: text(row.location),
      employmentType: text(row.employmentType) as EmploymentType,
      roleEn: text(row.roleEn),
      roleVi: text(row.roleVi),
      summaryEn: text(row.summaryEn),
      summaryVi: text(row.summaryVi),
      highlightsEn: text(row.highlightsEn),
      highlightsVi: text(row.highlightsVi),
      startDate,
      endDate: parseMonthDate(optionalText(row.endDate)),
      skillSlugs: Array.isArray(row.skills) ? row.skills.map((slug) => String(slug)) : [],
      sortOrder: int(row.sortOrder),
      isVisible: bool(row.isVisible),
    };
  });
}

export function mapEducation(data: PortfolioJson) {
  return data.education.map((row, index) => {
    const startDate = parseMonthDate(text(row.startDate));
    const endDate = parseMonthDate(text(row.endDate));
    if (!startDate || !endDate) {
      throw new Error(`education ${text(row.school)} is missing dates`);
    }
    return {
      school: text(row.school),
      degreeEn: text(row.degreeEn),
      degreeVi: text(row.degreeVi),
      majorEn: text(row.majorEn),
      majorVi: text(row.majorVi),
      startDate,
      endDate,
      sortOrder: int(row.sortOrder, index),
      isVisible: bool(row.isVisible),
    };
  });
}

export function mapPrinciples(data: PortfolioJson) {
  return data.principles.map((row) => ({
    titleEn: text(row.titleEn),
    titleVi: text(row.titleVi),
    bodyEn: text(row.bodyEn),
    bodyVi: text(row.bodyVi),
    iconKey: text(row.iconKey),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapProfileStats(data: PortfolioJson) {
  return data.profileStats.map((row) => ({
    labelEn: text(row.labelEn),
    labelVi: text(row.labelVi),
    value: optionalText(row.value),
    suffix: optionalText(row.suffix),
    source: text(row.source) as StatSource,
    iconKey: text(row.iconKey),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapProcessSteps(data: PortfolioJson) {
  return data.processSteps.map((row) => ({
    titleEn: text(row.titleEn),
    titleVi: text(row.titleVi),
    captionEn: text(row.captionEn),
    captionVi: text(row.captionVi),
    iconKey: text(row.iconKey),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapDomains(data: PortfolioJson) {
  return data.domains.map((row) => ({
    slug: text(row.slug),
    nameEn: text(row.nameEn),
    nameVi: text(row.nameVi),
    descriptionEn: text(row.descriptionEn),
    descriptionVi: text(row.descriptionVi),
    hue: text(row.hue) as Hue,
    iconKey: text(row.iconKey),
    sortOrder: int(row.sortOrder),
    isVisible: bool(row.isVisible),
  }));
}

export function mapReleaseStatus(value: unknown): PortfolioReleaseStatus | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const row = value as { released?: unknown; notReleased?: unknown };
  return {
    released: Array.isArray(row.released) ? row.released.map((item) => String(item)) : [],
    notReleased: Array.isArray(row.notReleased) ? row.notReleased.map((item) => String(item)) : [],
  };
}

export function mapProjects(data: PortfolioJson) {
  return data.projects.map((row) => ({
    slug: text(row.slug),
    titleEn: text(row.titleEn),
    titleVi: text(row.titleVi),
    taglineEn: text(row.taglineEn),
    taglineVi: text(row.taglineVi),
    client: text(row.client),
    roleEn: text(row.roleEn),
    roleVi: text(row.roleVi),
    teamSize: optionalInt(row.teamSize),
    startDate: parseMonthDate(text(row.startDate)),
    endDate: parseMonthDate(optionalText(row.endDate)),
    versionFrom: optionalText(row.versionFrom),
    versionTo: optionalText(row.versionTo),
    isFeatured: bool(row.isFeatured, false),
    isConfidential: bool(row.isConfidential, false),
    liveUrl: optionalText(row.liveUrl),
    repoUrl: optionalText(row.repoUrl),
    domainSlug: text(row.domain),
    experienceKey: text(row.experience),
    problemEn: text(row.problemEn),
    problemVi: text(row.problemVi),
    constraintsEn: text(row.constraintsEn),
    constraintsVi: text(row.constraintsVi),
    approachEn: text(row.approachEn),
    approachVi: text(row.approachVi),
    decisionsEn: text(row.decisionsEn),
    decisionsVi: text(row.decisionsVi),
    outcomeEn: text(row.outcomeEn),
    outcomeVi: text(row.outcomeVi),
    lessonsEn: text(row.lessonsEn),
    lessonsVi: text(row.lessonsVi),
    keyFactsEn: text(row.keyFactsEn),
    keyFactsVi: text(row.keyFactsVi),
    factChipsEn: text(row.factChipsEn),
    factChipsVi: text(row.factChipsVi),
    seoTitleEn: optionalText(row.seoTitleEn),
    seoTitleVi: optionalText(row.seoTitleVi),
    seoDescriptionEn: optionalText(row.seoDescriptionEn),
    seoDescriptionVi: optionalText(row.seoDescriptionVi),
    notMineEn: optionalText(row.notMineEn) ?? optionalText(row.notMine),
    notMineVi: optionalText(row.notMineVi),
    releaseStatus: mapReleaseStatus(row.releaseStatus),
    skillSlugs: Array.isArray(row.skills) ? row.skills.map((slug) => String(slug)) : [],
    metrics: Array.isArray(row.metrics)
      ? row.metrics.map((metric, index) => {
          const item = metric as Record<string, unknown>;
          return {
            labelEn: text(item.labelEn),
            labelVi: text(item.labelVi),
            before: optionalText(item.before),
            after: optionalText(item.after),
            value: text(item.value),
            sortOrder: index,
          };
        })
      : [],
    status: parseContentStatus(row.status),
    // PUBLISHED rows without a stored date get the seed run time (the migration's NOW(3)).
    publishedAt: publishedAtFor(parseContentStatus(row.status), row.publishedAt),
    sortOrder: int(row.sortOrder),
  }));
}

function parseContentStatus(value: unknown): ContentStatus {
  if (value === 'PUBLISHED' || value === 'ARCHIVED' || value === 'DRAFT') {
    return value;
  }
  return 'DRAFT';
}

function publishedAtFor(status: ContentStatus, value: unknown): Date | null {
  if (status !== 'PUBLISHED') {
    return null;
  }
  return parseMonthDate(optionalText(value)) ?? new Date();
}

/**
 * Fields with no Prisma column, plus values the typed column cannot hold.
 * Copied from the source; nothing here is rewritten.
 */
export function buildUnmappedNote(data: PortfolioJson) {
  return {
    _note:
      'Fields from portfolio-data.json with no Prisma column, or values that cannot be stored as typed. Copied exactly. Do not invent replacements. PageSection became PageBlock (PLAN D26); titles that match a block key are also overlaid onto that block.',
    _meta: data._meta,
    siteSettings: {
      availability: data.siteSettings.availability,
      availabilityStoredAs: SITE_AVAILABILITY_FALLBACK,
      reason: 'SiteSettings.availability is an enum (OPEN | NOT_LOOKING | FREELANCE).',
    },
    pageSections: data.pageSections,
    skillCategorySlugs: data.skillCategories.map((row) => ({
      slug: row.slug,
      reason: 'SkillCategory has no slug column; slug is a seed join key only.',
    })),
    experience: data.experience.map((row) => ({
      key: row.key,
      clientNote: row.clientNote ?? null,
      evidence: row.evidence ?? null,
      todo: row.todo ?? null,
      reason: 'Experience has no key / clientNote / evidence / todo columns.',
    })),
    profileStats: data.profileStats
      .filter((row) => row.note != null)
      .map((row) => ({
        labelEn: row.labelEn,
        note: row.note,
        reason: 'ProfileStat has no note column.',
      })),
    projects: data.projects
      .filter((row) => row.note != null)
      .map((row) => ({
        slug: row.slug,
        note: row.note,
        reason: 'Project has no free-form note column.',
      })),
    _skillsNote: data._skillsNote ?? null,
    _principlesNote: data._principlesNote ?? null,
    _postsNote: data._postsNote ?? null,
    gaps: data.gaps,
  };
}

export type LocalizedProp = { en: string; vi: string };

export function overlayPageSectionTitles<
  T extends {
    key: string;
    blocks: {
      key: string;
      isVisible: boolean;
      props: Record<string, unknown>;
    }[];
  },
>(pages: T[], sections: PortfolioJson['pageSections']): T[] {
  const byPage = new Map(pages.map((page) => [page.key, page]));
  for (const section of sections) {
    const page = byPage.get(section.page);
    const block = page?.blocks.find((item) => item.key === section.key);
    if (!page || !block) {
      continue;
    }
    block.isVisible = section.isVisible;
    if (section.titleEn == null && section.titleVi == null) {
      continue;
    }
    const heading = block.props.heading as { title?: LocalizedProp } | undefined;
    if (heading?.title) {
      if (section.titleEn != null) {
        heading.title.en = section.titleEn;
      }
      if (section.titleVi != null) {
        heading.title.vi = section.titleVi;
      }
      continue;
    }
    const title = block.props.title as LocalizedProp | undefined;
    if (title) {
      if (section.titleEn != null) {
        title.en = section.titleEn;
      }
      if (section.titleVi != null) {
        title.vi = section.titleVi;
      }
    }
  }
  return pages;
}
