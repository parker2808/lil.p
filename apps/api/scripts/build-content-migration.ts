import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pagesData } from '../prisma/seed/data/pages.data';
import {
  buildUnmappedNote,
  loadPortfolioData,
  mapContactTopics,
  mapDomains,
  mapEducation,
  mapExperience,
  mapNavItems,
  mapPrinciples,
  mapProcessSteps,
  mapProfile,
  mapProfileStats,
  mapProjects,
  mapSiteSettings,
  mapSkillCategories,
  mapSkills,
  mapSocialLinks,
  overlayPageSectionTitles,
} from '../prisma/seed/data/portfolio.mapper';

/**
 * Turns `prisma/seed/data/portfolio-data.json` into a TiDB-safe Prisma
 * data migration: INSERT … ON DUPLICATE KEY UPDATE only. Never deletes
 * users, media, inbox, views, or audit rows. Extra rows Parker added
 * stay; matching ids / slugs are updated.
 *
 *   pnpm --filter @portfolio/api content:migration
 *   pnpm --filter @portfolio/api content:migration -- --check
 */

const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, '..');
export const MIGRATION_NAME = '20261027150000_portfolio_content';
export const MIGRATION_DIR = resolve(apiRoot, 'prisma/migrations', MIGRATION_NAME);
export const MIGRATION_SQL_PATH = resolve(MIGRATION_DIR, 'migration.sql');
const UNMAPPED_PATH = resolve(apiRoot, 'prisma/seed/data/portfolio-unmapped.json');
const VARCHAR = 191;

type SqlValue = string;

export type ContentCounts = {
  site_settings: number;
  profile: number;
  nav_item: number;
  social_link: number;
  contact_topic: number;
  skill_category: number;
  skill: number;
  experience: number;
  education: number;
  principle: number;
  profile_stat: number;
  process_step: number;
  domain: number;
  project: number;
  project_metric: number;
  page: number;
  page_block: number;
  _ExperienceToSkill: number;
  _ProjectToSkill: number;
};

function quoteId(name: string): string {
  return `\`${name.replaceAll('`', '')}\``;
}

function sqlString(value: string, max = VARCHAR): string {
  if (value.length > max) {
    throw new Error(`Value exceeds VARCHAR(${max}): ${value.slice(0, 40)}… (${value.length})`);
  }
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;
}

function sqlText(value: string): string {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;
}

function sqlNull(): SqlValue {
  return 'NULL';
}

function sqlBool(value: boolean): SqlValue {
  return value ? '1' : '0';
}

function sqlInt(value: number | null | undefined): SqlValue {
  return value == null ? 'NULL' : String(Math.trunc(value));
}

function sqlDate(value: Date | null | undefined): SqlValue {
  if (!value) {
    return 'NULL';
  }
  return `'${value.toISOString().slice(0, 10)}'`;
}

function sqlJson(value: unknown): SqlValue {
  if (value == null) {
    return 'NULL';
  }
  return `CAST(${sqlText(JSON.stringify(value))} AS JSON)`;
}

function sqlNow(): SqlValue {
  return 'CURRENT_TIMESTAMP(3)';
}

function rowSql(values: SqlValue[]): string {
  return `  (${values.join(', ')})`;
}

function insertOnDuplicate(options: {
  table: string;
  columns: string[];
  rows: SqlValue[][];
  update: string[];
}): string {
  if (options.rows.length < 1) {
    return `-- ${options.table}: nothing to insert`;
  }
  const cols = options.columns.map(quoteId).join(', ');
  const updates = options.update
    .map((col) => `  ${quoteId(col)} = VALUES(${quoteId(col)})`)
    .join(',\n');
  return [
    `INSERT INTO ${quoteId(options.table)} (${cols})`,
    'VALUES',
    options.rows.map(rowSql).join(',\n'),
    'ON DUPLICATE KEY UPDATE',
    updates,
    ';',
  ].join('\n');
}

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]!;
    if (inString) {
      current += char;
      if (char === '\\' && index + 1 < sql.length) {
        current += sql[index + 1];
        index += 1;
        continue;
      }
      if (char === "'") {
        if (sql[index + 1] === "'") {
          current += "'";
          index += 1;
          continue;
        }
        inString = false;
      }
      continue;
    }
    if (char === "'") {
      inString = true;
      current += char;
      continue;
    }
    if (char === '-' && sql[index + 1] === '-') {
      while (index < sql.length && sql[index] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (char === ';') {
      const statement = current.trim();
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = '';
      continue;
    }
    current += char;
  }
  const tail = current.trim();
  if (tail.length > 0) {
    statements.push(tail);
  }
  return statements;
}

export function buildContentMigration(): { sql: string; counts: ContentCounts } {
  const data = loadPortfolioData();
  const site = mapSiteSettings(data);
  const profile = mapProfile(data);
  const nav = mapNavItems(data);
  const social = mapSocialLinks(data);
  const topics = mapContactTopics(data);
  const categories = mapSkillCategories(data);
  const skills = mapSkills(data);
  const experience = mapExperience(data);
  const education = mapEducation(data);
  const principles = mapPrinciples(data);
  const stats = mapProfileStats(data);
  const steps = mapProcessSteps(data);
  const domains = mapDomains(data);
  const projects = mapProjects(data);
  const pages = overlayPageSectionTitles(
    structuredClone(pagesData) as typeof pagesData,
    data.pageSections,
  );

  const categoryId = new Map(categories.map((row, index) => [row.slug, index + 1]));
  const experienceId = new Map(experience.map((row, index) => [row.key, index + 1]));
  const domainId = new Map(domains.map((row, index) => [row.slug, index + 1]));

  const metricRows: SqlValue[][] = [];
  let metricId = 0;
  for (const [projectIndex, project] of projects.entries()) {
    for (const metric of project.metrics) {
      metricId += 1;
      metricRows.push([
        sqlInt(metricId),
        sqlInt(projectIndex + 1),
        sqlString(metric.labelEn),
        sqlString(metric.labelVi),
        metric.before == null ? sqlNull() : sqlString(metric.before),
        metric.after == null ? sqlNull() : sqlString(metric.after),
        sqlString(metric.value),
        sqlInt(metric.sortOrder),
        sqlNow(),
        sqlNow(),
      ]);
    }
  }

  const experienceSkillPairs: { experienceId: number; slug: string }[] = [];
  for (const [index, row] of experience.entries()) {
    for (const slug of row.skillSlugs) {
      if (!skills.some((skill) => skill.slug === slug)) {
        throw new Error(`Unknown experience skill ${slug}`);
      }
      experienceSkillPairs.push({ experienceId: index + 1, slug });
    }
  }
  const projectSkillPairs: { projectSlug: string; slug: string }[] = [];
  for (const project of projects) {
    for (const slug of project.skillSlugs) {
      if (!skills.some((skill) => skill.slug === slug)) {
        throw new Error(`Unknown project skill ${slug} on ${project.slug}`);
      }
      projectSkillPairs.push({ projectSlug: project.slug, slug });
    }
  }

  const pageBlockCount = pages.reduce((sum, page) => sum + page.blocks.length, 0);

  const parts: string[] = [
    '-- Portfolio owner content. Generated by apps/api/scripts/build-content-migration.ts',
    '-- from prisma/seed/data/portfolio-data.json. Do not hand-edit.',
    '--',
    '-- Idempotent: INSERT … ON DUPLICATE KEY UPDATE (row tables) and',
    '-- INSERT IGNORE (join tables). Safe on TiDB Serverless',
    '-- (utf8mb4, JSON, no generated columns or CHECK constraints).',
    '-- Join inserts must not update column A from an unaliased A (TiDB 1052).',
    '-- Does not DELETE users, media, contact_message, page_view, audit_log,',
    '-- or extra rows Parker added beyond these ids/slugs.',
    '-- Project status / isConfidential come from the JSON. Pages publish',
    '-- version 1 only when the page has no versions yet.',
    '',
  ];

  parts.push(
    insertOnDuplicate({
      table: 'site_settings',
      columns: [
        'id',
        'siteName',
        'domain',
        'defaultLocale',
        'seoTitleEn',
        'seoTitleVi',
        'seoDescriptionEn',
        'seoDescriptionVi',
        'ogImageId',
        'footerNoteEn',
        'footerNoteVi',
        'contactIntroEn',
        'contactIntroVi',
        'replyTimeNoteEn',
        'replyTimeNoteVi',
        'contactEmail',
        'availability',
        'availabilityNoteEn',
        'availabilityNoteVi',
        'analyticsEnabled',
        'ambientEffects',
        'marqueeEnabled',
        'createdAt',
        'updatedAt',
      ],
      rows: [
        [
          sqlInt(1),
          sqlString(site.siteName),
          sqlString(site.domain),
          sqlString(site.defaultLocale, 8),
          sqlString(site.seoTitleEn),
          sqlString(site.seoTitleVi),
          sqlText(site.seoDescriptionEn),
          sqlText(site.seoDescriptionVi),
          sqlInt(site.ogImageId),
          sqlString(site.footerNoteEn),
          sqlString(site.footerNoteVi),
          sqlText(site.contactIntroEn),
          sqlText(site.contactIntroVi),
          sqlString(site.replyTimeNoteEn),
          sqlString(site.replyTimeNoteVi),
          sqlString(site.contactEmail),
          sqlString(site.availability),
          sqlString(site.availabilityNoteEn),
          sqlString(site.availabilityNoteVi),
          sqlBool(site.analyticsEnabled),
          sqlBool(site.ambientEffects),
          sqlBool(site.marqueeEnabled),
          sqlNow(),
          sqlNow(),
        ],
      ],
      update: [
        'siteName',
        'domain',
        'defaultLocale',
        'seoTitleEn',
        'seoTitleVi',
        'seoDescriptionEn',
        'seoDescriptionVi',
        'footerNoteEn',
        'footerNoteVi',
        'contactIntroEn',
        'contactIntroVi',
        'replyTimeNoteEn',
        'replyTimeNoteVi',
        'contactEmail',
        'availability',
        'availabilityNoteEn',
        'availabilityNoteVi',
        'analyticsEnabled',
        'ambientEffects',
        'marqueeEnabled',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'profile',
      columns: [
        'id',
        'displayName',
        'legalName',
        'city',
        'country',
        'timezone',
        'careerStartDate',
        'headlineEn',
        'headlineVi',
        'subheadlineEn',
        'subheadlineVi',
        'bioEn',
        'bioVi',
        'languagesEn',
        'languagesVi',
        'heroKickerEn',
        'heroKickerVi',
        'headlineAccentEn',
        'headlineAccentVi',
        'avatarId',
        'resumeEnId',
        'resumeViId',
        'phone',
        'createdAt',
        'updatedAt',
      ],
      rows: [
        [
          sqlInt(1),
          sqlString(profile.displayName),
          sqlString(profile.legalName),
          sqlString(profile.city),
          sqlString(profile.country),
          sqlString(profile.timezone),
          sqlDate(profile.careerStartDate),
          sqlText(profile.headlineEn),
          sqlText(profile.headlineVi),
          sqlText(profile.subheadlineEn),
          sqlText(profile.subheadlineVi),
          sqlText(profile.bioEn),
          sqlText(profile.bioVi),
          sqlString(profile.languagesEn),
          sqlString(profile.languagesVi),
          profile.heroKickerEn == null ? sqlNull() : sqlString(profile.heroKickerEn),
          profile.heroKickerVi == null ? sqlNull() : sqlString(profile.heroKickerVi),
          profile.headlineAccentEn == null ? sqlNull() : sqlString(profile.headlineAccentEn),
          profile.headlineAccentVi == null ? sqlNull() : sqlString(profile.headlineAccentVi),
          sqlInt(profile.avatarId),
          sqlInt(profile.resumeEnId),
          sqlInt(profile.resumeViId),
          profile.phone == null ? sqlNull() : sqlString(profile.phone),
          sqlNow(),
          sqlNow(),
        ],
      ],
      update: [
        'displayName',
        'legalName',
        'city',
        'country',
        'timezone',
        'careerStartDate',
        'headlineEn',
        'headlineVi',
        'subheadlineEn',
        'subheadlineVi',
        'bioEn',
        'bioVi',
        'languagesEn',
        'languagesVi',
        'heroKickerEn',
        'heroKickerVi',
        'headlineAccentEn',
        'headlineAccentVi',
        'phone',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'nav_item',
      columns: [
        'id',
        'location',
        'labelEn',
        'labelVi',
        'href',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: nav.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.location),
        sqlString(row.labelEn),
        sqlString(row.labelVi),
        sqlString(row.href),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: ['location', 'labelEn', 'labelVi', 'href', 'sortOrder', 'isVisible', 'updatedAt'],
    }),
    '',
    insertOnDuplicate({
      table: 'social_link',
      columns: [
        'id',
        'kind',
        'labelEn',
        'labelVi',
        'url',
        'showInHeader',
        'showInCta',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: social.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.kind),
        sqlString(row.labelEn),
        sqlString(row.labelVi),
        sqlString(row.url),
        sqlBool(row.showInHeader),
        sqlBool(row.showInCta),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'kind',
        'labelEn',
        'labelVi',
        'url',
        'showInHeader',
        'showInCta',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'contact_topic',
      columns: [
        'id',
        'slug',
        'labelEn',
        'labelVi',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: topics.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.slug),
        sqlString(row.labelEn),
        sqlString(row.labelVi),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: ['slug', 'labelEn', 'labelVi', 'sortOrder', 'isVisible', 'updatedAt'],
    }),
    '',
    insertOnDuplicate({
      table: 'skill_category',
      columns: ['id', 'nameEn', 'nameVi', 'sortOrder', 'createdAt', 'updatedAt'],
      rows: categories.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.nameEn),
        sqlString(row.nameVi),
        sqlInt(row.sortOrder),
        sqlNow(),
        sqlNow(),
      ]),
      update: ['nameEn', 'nameVi', 'sortOrder', 'updatedAt'],
    }),
    '',
    insertOnDuplicate({
      table: 'skill',
      columns: [
        'id',
        'name',
        'slug',
        'categoryId',
        'depth',
        'showInMarquee',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: skills.map((row, index) => {
        const category = categoryId.get(row.category);
        if (!category) {
          throw new Error(`Unknown skill category ${row.category}`);
        }
        return [
          sqlInt(index + 1),
          sqlString(row.name),
          sqlString(row.slug),
          sqlInt(category),
          sqlString(row.depth),
          sqlBool(row.showInMarquee),
          sqlInt(row.sortOrder),
          sqlBool(row.isVisible),
          sqlNow(),
          sqlNow(),
        ];
      }),
      update: [
        'name',
        'slug',
        'categoryId',
        'depth',
        'showInMarquee',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'experience',
      columns: [
        'id',
        'company',
        'companyUrl',
        'location',
        'employmentType',
        'roleEn',
        'roleVi',
        'summaryEn',
        'summaryVi',
        'highlightsEn',
        'highlightsVi',
        'startDate',
        'endDate',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: experience.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.company),
        row.companyUrl == null ? sqlNull() : sqlString(row.companyUrl),
        sqlString(row.location),
        sqlString(row.employmentType),
        sqlString(row.roleEn),
        sqlString(row.roleVi),
        sqlText(row.summaryEn),
        sqlText(row.summaryVi),
        sqlText(row.highlightsEn),
        sqlText(row.highlightsVi),
        sqlDate(row.startDate),
        sqlDate(row.endDate),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'company',
        'companyUrl',
        'location',
        'employmentType',
        'roleEn',
        'roleVi',
        'summaryEn',
        'summaryVi',
        'highlightsEn',
        'highlightsVi',
        'startDate',
        'endDate',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'education',
      columns: [
        'id',
        'school',
        'degreeEn',
        'degreeVi',
        'majorEn',
        'majorVi',
        'startDate',
        'endDate',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: education.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.school),
        sqlString(row.degreeEn),
        sqlString(row.degreeVi),
        sqlString(row.majorEn),
        sqlString(row.majorVi),
        sqlDate(row.startDate),
        sqlDate(row.endDate),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'school',
        'degreeEn',
        'degreeVi',
        'majorEn',
        'majorVi',
        'startDate',
        'endDate',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'principle',
      columns: [
        'id',
        'titleEn',
        'titleVi',
        'bodyEn',
        'bodyVi',
        'iconKey',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: principles.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.titleEn),
        sqlString(row.titleVi),
        sqlText(row.bodyEn),
        sqlText(row.bodyVi),
        sqlString(row.iconKey, 48),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'titleEn',
        'titleVi',
        'bodyEn',
        'bodyVi',
        'iconKey',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'profile_stat',
      columns: [
        'id',
        'labelEn',
        'labelVi',
        'value',
        'suffix',
        'source',
        'iconKey',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: stats.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.labelEn),
        sqlString(row.labelVi),
        row.value == null ? sqlNull() : sqlString(row.value),
        row.suffix == null ? sqlNull() : sqlString(row.suffix),
        sqlString(row.source),
        sqlString(row.iconKey, 48),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'labelEn',
        'labelVi',
        'value',
        'suffix',
        'source',
        'iconKey',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'process_step',
      columns: [
        'id',
        'titleEn',
        'titleVi',
        'captionEn',
        'captionVi',
        'iconKey',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: steps.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.titleEn),
        sqlString(row.titleVi),
        sqlString(row.captionEn),
        sqlString(row.captionVi),
        sqlString(row.iconKey, 48),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'titleEn',
        'titleVi',
        'captionEn',
        'captionVi',
        'iconKey',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
    insertOnDuplicate({
      table: 'domain',
      columns: [
        'id',
        'slug',
        'nameEn',
        'nameVi',
        'descriptionEn',
        'descriptionVi',
        'hue',
        'iconKey',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: domains.map((row, index) => [
        sqlInt(index + 1),
        sqlString(row.slug),
        sqlString(row.nameEn),
        sqlString(row.nameVi),
        sqlText(row.descriptionEn),
        sqlText(row.descriptionVi),
        sqlString(row.hue),
        sqlString(row.iconKey, 48),
        sqlInt(row.sortOrder),
        sqlBool(row.isVisible),
        sqlNow(),
        sqlNow(),
      ]),
      update: [
        'slug',
        'nameEn',
        'nameVi',
        'descriptionEn',
        'descriptionVi',
        'hue',
        'iconKey',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
  );

  const projectInsert = insertOnDuplicate({
    table: 'project',
    columns: [
      'id',
      'slug',
      'titleEn',
      'titleVi',
      'taglineEn',
      'taglineVi',
      'client',
      'roleEn',
      'roleVi',
      'teamSize',
      'startDate',
      'endDate',
      'versionFrom',
      'versionTo',
      'isFeatured',
      'isConfidential',
      'liveUrl',
      'repoUrl',
      'problemEn',
      'problemVi',
      'constraintsEn',
      'constraintsVi',
      'approachEn',
      'approachVi',
      'decisionsEn',
      'decisionsVi',
      'outcomeEn',
      'outcomeVi',
      'lessonsEn',
      'lessonsVi',
      'keyFactsEn',
      'keyFactsVi',
      'factChipsEn',
      'factChipsVi',
      'notMineEn',
      'notMineVi',
      'releaseStatus',
      'seoTitleEn',
      'seoTitleVi',
      'seoDescriptionEn',
      'seoDescriptionVi',
      'status',
      'publishedAt',
      'sortOrder',
      'domainId',
      'experienceId',
      'createdAt',
      'updatedAt',
    ],
    rows: projects.map((project, index) => {
      if (!project.startDate) {
        throw new Error(`Project ${project.slug} is missing startDate`);
      }
      if (project.domainSlug && !domainId.has(project.domainSlug)) {
        throw new Error(`Unknown project domain ${project.domainSlug}`);
      }
      if (project.experienceKey && !experienceId.has(project.experienceKey)) {
        throw new Error(`Unknown project experience ${project.experienceKey}`);
      }
      const domainSql = project.domainSlug
        ? sqlInt(domainId.get(project.domainSlug) ?? null)
        : sqlNull();
      const experienceSql = project.experienceKey
        ? sqlInt(experienceId.get(project.experienceKey) ?? null)
        : sqlNull();
      return [
        sqlInt(index + 1),
        sqlString(project.slug),
        sqlString(project.titleEn),
        sqlString(project.titleVi),
        sqlText(project.taglineEn),
        sqlText(project.taglineVi),
        sqlString(project.client),
        sqlString(project.roleEn),
        sqlString(project.roleVi),
        sqlInt(project.teamSize),
        sqlDate(project.startDate),
        sqlDate(project.endDate),
        project.versionFrom == null ? sqlNull() : sqlString(project.versionFrom),
        project.versionTo == null ? sqlNull() : sqlString(project.versionTo),
        sqlBool(project.isFeatured),
        sqlBool(project.isConfidential),
        project.liveUrl == null ? sqlNull() : sqlString(project.liveUrl),
        project.repoUrl == null ? sqlNull() : sqlString(project.repoUrl),
        sqlText(project.problemEn),
        sqlText(project.problemVi),
        sqlText(project.constraintsEn),
        sqlText(project.constraintsVi),
        sqlText(project.approachEn),
        sqlText(project.approachVi),
        sqlText(project.decisionsEn),
        sqlText(project.decisionsVi),
        sqlText(project.outcomeEn),
        sqlText(project.outcomeVi),
        sqlText(project.lessonsEn),
        sqlText(project.lessonsVi),
        sqlText(project.keyFactsEn),
        sqlText(project.keyFactsVi),
        sqlString(project.factChipsEn),
        sqlString(project.factChipsVi),
        project.notMineEn == null ? sqlNull() : sqlText(project.notMineEn),
        project.notMineVi == null ? sqlNull() : sqlText(project.notMineVi),
        sqlJson(project.releaseStatus),
        project.seoTitleEn == null ? sqlNull() : sqlString(project.seoTitleEn),
        project.seoTitleVi == null ? sqlNull() : sqlString(project.seoTitleVi),
        project.seoDescriptionEn == null ? sqlNull() : sqlText(project.seoDescriptionEn),
        project.seoDescriptionVi == null ? sqlNull() : sqlText(project.seoDescriptionVi),
        sqlString(project.status),
        sqlNull(),
        sqlInt(project.sortOrder),
        domainSql,
        experienceSql,
        sqlNow(),
        sqlNow(),
      ];
    }),
    update: [
      'slug',
      'titleEn',
      'titleVi',
      'taglineEn',
      'taglineVi',
      'client',
      'roleEn',
      'roleVi',
      'teamSize',
      'startDate',
      'endDate',
      'versionFrom',
      'versionTo',
      'isFeatured',
      'isConfidential',
      'liveUrl',
      'repoUrl',
      'problemEn',
      'problemVi',
      'constraintsEn',
      'constraintsVi',
      'approachEn',
      'approachVi',
      'decisionsEn',
      'decisionsVi',
      'outcomeEn',
      'outcomeVi',
      'lessonsEn',
      'lessonsVi',
      'keyFactsEn',
      'keyFactsVi',
      'factChipsEn',
      'factChipsVi',
      'notMineEn',
      'notMineVi',
      'releaseStatus',
      'seoTitleEn',
      'seoTitleVi',
      'seoDescriptionEn',
      'seoDescriptionVi',
      'status',
      'publishedAt',
      'sortOrder',
      'domainId',
      'experienceId',
      'updatedAt',
    ],
  });
  parts.push(projectInsert, '');

  parts.push(
    insertOnDuplicate({
      table: 'project_metric',
      columns: [
        'id',
        'projectId',
        'labelEn',
        'labelVi',
        'before',
        'after',
        'value',
        'sortOrder',
        'createdAt',
        'updatedAt',
      ],
      rows: metricRows,
      update: [
        'projectId',
        'labelEn',
        'labelVi',
        'before',
        'after',
        'value',
        'sortOrder',
        'updatedAt',
      ],
    }),
    '',
  );

  if (experienceSkillPairs.length > 0) {
    const values = experienceSkillPairs
      .map(
        (pair) =>
          `SELECT ${sqlInt(pair.experienceId)}, s.id FROM ${quoteId('skill')} s WHERE s.slug = ${sqlString(pair.slug)}`,
      )
      .join('\nUNION ALL\n');
    parts.push(
      `INSERT IGNORE INTO ${quoteId('_ExperienceToSkill')} (${quoteId('A')}, ${quoteId('B')})`,
      values,
      ';',
      '',
    );
  }

  if (projectSkillPairs.length > 0) {
    const values = projectSkillPairs
      .map(
        (pair) =>
          `SELECT p.id, s.id FROM ${quoteId('project')} p INNER JOIN ${quoteId('skill')} s ON p.slug = ${sqlString(pair.projectSlug)} AND s.slug = ${sqlString(pair.slug)}`,
      )
      .join('\nUNION ALL\n');
    parts.push(
      `INSERT IGNORE INTO ${quoteId('_ProjectToSkill')} (${quoteId('A')}, ${quoteId('B')})`,
      values,
      ';',
      '',
    );
  }

  parts.push(
    insertOnDuplicate({
      table: 'page',
      columns: [
        'key',
        'seoTitleEn',
        'seoTitleVi',
        'seoDescriptionEn',
        'seoDescriptionVi',
        'createdAt',
        'updatedAt',
      ],
      rows: pages.map((page) => [
        sqlString(page.key),
        sqlString(page.seoTitleEn),
        sqlString(page.seoTitleVi),
        sqlText(page.seoDescriptionEn),
        sqlText(page.seoDescriptionVi),
        sqlNow(),
        sqlNow(),
      ]),
      update: ['seoTitleEn', 'seoTitleVi', 'seoDescriptionEn', 'seoDescriptionVi', 'updatedAt'],
    }),
    '',
  );

  const blockRows = pages.flatMap((page) =>
    page.blocks.map((block) => [
      `(SELECT id FROM ${quoteId('page')} WHERE ${quoteId('key')} = ${sqlString(page.key)})`,
      sqlString(block.type, 48),
      sqlString(block.key, 48),
      sqlInt(block.schemaVersion),
      sqlJson(block.props),
      sqlString(block.layout),
      sqlString(block.surface),
      sqlInt(block.sortOrder),
      sqlBool(block.isVisible),
      sqlNow(),
      sqlNow(),
    ]),
  );
  parts.push(
    insertOnDuplicate({
      table: 'page_block',
      columns: [
        'pageId',
        'type',
        'key',
        'schemaVersion',
        'props',
        'layout',
        'surface',
        'sortOrder',
        'isVisible',
        'createdAt',
        'updatedAt',
      ],
      rows: blockRows,
      update: [
        'type',
        'schemaVersion',
        'props',
        'layout',
        'surface',
        'sortOrder',
        'isVisible',
        'updatedAt',
      ],
    }),
    '',
  );

  for (const page of pages) {
    const snapshot = {
      seo: {
        seoTitleEn: page.seoTitleEn,
        seoTitleVi: page.seoTitleVi,
        seoDescriptionEn: page.seoDescriptionEn,
        seoDescriptionVi: page.seoDescriptionVi,
      },
      blocks: page.blocks.map((block) => ({
        type: block.type,
        key: block.key,
        schemaVersion: block.schemaVersion,
        props: block.props,
        layout: block.layout,
        surface: block.surface,
        isVisible: block.isVisible,
        sortOrder: block.sortOrder,
      })),
    };
    parts.push(
      `-- Publish ${page.key} only when the page has no versions yet.`,
      `INSERT INTO ${quoteId('page_version')} (${quoteId('pageId')}, ${quoteId('version')}, ${quoteId('snapshot')}, ${quoteId('note')}, ${quoteId('createdAt')})`,
      `SELECT p.id, 1, ${sqlJson(snapshot)}, ${sqlString('Portfolio content v1')}, ${sqlNow()}`,
      `FROM ${quoteId('page')} p`,
      `WHERE p.${quoteId('key')} = ${sqlString(page.key)}`,
      `  AND NOT EXISTS (SELECT 1 FROM ${quoteId('page_version')} v WHERE v.pageId = p.id);`,
      `UPDATE ${quoteId('page')} p`,
      `INNER JOIN ${quoteId('page_version')} v ON v.pageId = p.id AND v.version = 1`,
      `SET p.publishedVersionId = v.id, p.publishedAt = COALESCE(p.publishedAt, ${sqlNow()}), p.updatedAt = ${sqlNow()}`,
      `WHERE p.${quoteId('key')} = ${sqlString(page.key)} AND p.publishedVersionId IS NULL;`,
      '',
    );
  }

  const counts: ContentCounts = {
    site_settings: 1,
    profile: 1,
    nav_item: nav.length,
    social_link: social.length,
    contact_topic: topics.length,
    skill_category: categories.length,
    skill: skills.length,
    experience: experience.length,
    education: education.length,
    principle: principles.length,
    profile_stat: stats.length,
    process_step: steps.length,
    domain: domains.length,
    project: projects.length,
    project_metric: metricRows.length,
    page: pages.length,
    page_block: pageBlockCount,
    _ExperienceToSkill: experienceSkillPairs.length,
    _ProjectToSkill: projectSkillPairs.length,
  };

  parts.push(
    '-- Expected counts (fresh apply):',
    ...Object.entries(counts).map(([table, count]) => `--   ${table}: ${count}`),
    '',
  );

  return { sql: `${parts.join('\n').trim()}\n`, counts };
}

export function writeContentMigration(): { sql: string; counts: ContentCounts } {
  const built = buildContentMigration();
  mkdirSync(MIGRATION_DIR, { recursive: true });
  writeFileSync(MIGRATION_SQL_PATH, built.sql);
  writeFileSync(
    UNMAPPED_PATH,
    `${JSON.stringify(buildUnmappedNote(loadPortfolioData()), null, 2)}\n`,
  );
  return built;
}

export function assertCommittedMigrationMatches(): void {
  const built = buildContentMigration();
  const committed = readFileSync(MIGRATION_SQL_PATH, 'utf8');
  if (committed !== built.sql) {
    throw new Error(
      `${MIGRATION_SQL_PATH} is stale. Run pnpm --filter @portfolio/api content:migration`,
    );
  }
}

function isMain(): boolean {
  const invoked = process.argv[1] ? resolve(process.argv[1]) : '';
  return invoked === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const check = process.argv.includes('--check');
  if (check) {
    assertCommittedMigrationMatches();
    console.log(`Content migration is up to date (${MIGRATION_NAME}).`);
  } else {
    const built = writeContentMigration();
    console.log(`Wrote ${MIGRATION_SQL_PATH}`);
    console.log(`Wrote ${UNMAPPED_PATH}`);
    console.log(JSON.stringify(built.counts, null, 2));
  }
}
