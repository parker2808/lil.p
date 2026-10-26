import { Injectable } from '@nestjs/common';
import type {
  AdminHealth,
  AdminHealthIssue,
  AdminStats,
  ContentStatus,
  ContentStatusCounts,
  StatsRange,
} from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import {
  lintFieldNames,
  missingViFieldNames,
  POST_LOCALE_FIELDS,
  PROJECT_LOCALE_FIELDS,
  splitFactLines,
} from './dashboard-health.util';
import { statsRangeWindow } from './dashboard-range.util';

type StatusCountRow = { status: ContentStatus; _count: { id: number } };

const EMPTY_COUNTS: ContentStatusCounts = {
  draft: 0,
  published: 0,
  archived: 0,
  publishedInRange: 0,
  publishedInPrevious: 0,
};

const PROJECT_HEALTH_SELECT = {
  id: true,
  titleEn: true,
  status: true,
  domainId: true,
  titleVi: true,
  taglineEn: true,
  taglineVi: true,
  roleEn: true,
  roleVi: true,
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
} as const;

const POST_HEALTH_SELECT = {
  id: true,
  titleEn: true,
  status: true,
  titleVi: true,
  excerptEn: true,
  excerptVi: true,
  bodyEn: true,
  bodyVi: true,
  takeawaysEn: true,
  takeawaysVi: true,
} as const;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(range: StatsRange): Promise<AdminStats> {
    const { periodStart, periodEnd, previousStart } = statsRangeWindow(range);
    const publishedIn = (gte: Date, lt: Date) => ({
      status: 'PUBLISHED' as const,
      publishedAt: { gte, lt },
    });

    const [projectGroups, postGroups, projectInRange, projectPrev, postInRange, postPrev] =
      await Promise.all([
        this.prisma.project.groupBy({ by: ['status'], _count: { id: true } }),
        this.prisma.post.groupBy({ by: ['status'], _count: { id: true } }),
        this.prisma.project.count({ where: publishedIn(periodStart, periodEnd) }),
        this.prisma.project.count({ where: publishedIn(previousStart, periodStart) }),
        this.prisma.post.count({ where: publishedIn(periodStart, periodEnd) }),
        this.prisma.post.count({ where: publishedIn(previousStart, periodStart) }),
      ]);

    return {
      range,
      projects: {
        ...toStatusCounts(projectGroups),
        publishedInRange: projectInRange,
        publishedInPrevious: projectPrev,
      },
      posts: {
        ...toStatusCounts(postGroups),
        publishedInRange: postInRange,
        publishedInPrevious: postPrev,
      },
    };
  }

  async getHealth(): Promise<AdminHealth> {
    const [projects, posts, marqueeCount] = await Promise.all([
      this.prisma.project.findMany({
        where: { status: { not: 'ARCHIVED' } },
        select: PROJECT_HEALTH_SELECT,
      }),
      this.prisma.post.findMany({
        where: { status: { not: 'ARCHIVED' } },
        select: POST_HEALTH_SELECT,
      }),
      this.prisma.skill.count({ where: { showInMarquee: true, isVisible: true } }),
    ]);

    const issues: AdminHealthIssue[] = [];

    for (const project of projects) {
      const href = `/admin/projects/${project.id}`;
      if (project.domainId === null) {
        issues.push({
          kind: 'PROJECT_NO_DOMAIN',
          entity: 'project',
          id: project.id,
          title: project.titleEn,
          href,
        });
      }
      const factCount = splitFactLines(project.keyFactsEn).length;
      if (factCount < 2) {
        issues.push({
          kind: 'CASE_STUDY_KEY_FACTS',
          entity: 'project',
          id: project.id,
          title: project.titleEn,
          href,
          count: factCount,
        });
      }
      if (project.status === 'PUBLISHED') {
        const fields = missingViFieldNames(localePairs(project, PROJECT_LOCALE_FIELDS));
        if (fields.length > 0) {
          issues.push({
            kind: 'MISSING_VI',
            entity: 'project',
            id: project.id,
            title: project.titleEn,
            href,
            fields,
          });
        }
      }
      const lintFields = lintFieldNames({
        titleEn: project.titleEn,
        taglineEn: project.taglineEn,
        roleEn: project.roleEn,
        problemEn: project.problemEn,
        constraintsEn: project.constraintsEn,
        approachEn: project.approachEn,
        decisionsEn: project.decisionsEn,
        outcomeEn: project.outcomeEn,
        lessonsEn: project.lessonsEn,
        keyFactsEn: project.keyFactsEn,
        factChipsEn: project.factChipsEn,
      });
      if (lintFields.length > 0) {
        issues.push({
          kind: 'PUBLISH_LINT',
          entity: 'project',
          id: project.id,
          title: project.titleEn,
          href,
          fields: lintFields,
        });
      }
    }

    for (const post of posts) {
      const href = `/admin/posts/${post.id}`;
      if (post.status === 'PUBLISHED') {
        const fields = missingViFieldNames(localePairs(post, POST_LOCALE_FIELDS));
        if (fields.length > 0) {
          issues.push({
            kind: 'MISSING_VI',
            entity: 'post',
            id: post.id,
            title: post.titleEn,
            href,
            fields,
          });
        }
      }
      const lintFields = lintFieldNames({
        titleEn: post.titleEn,
        excerptEn: post.excerptEn,
        bodyEn: post.bodyEn,
        takeawaysEn: post.takeawaysEn,
      });
      if (lintFields.length > 0) {
        issues.push({
          kind: 'PUBLISH_LINT',
          entity: 'post',
          id: post.id,
          title: post.titleEn,
          href,
          fields: lintFields,
        });
      }
    }

    if (marqueeCount < 6) {
      issues.push({
        kind: 'MARQUEE_SKILLS',
        entity: 'skill',
        id: null,
        title: '',
        href: '/admin/skills',
        count: marqueeCount,
      });
    }

    return {
      summary: {
        drafts:
          projects.filter((row) => row.status === 'DRAFT').length +
          posts.filter((row) => row.status === 'DRAFT').length,
        missingVi: issues.filter((issue) => issue.kind === 'MISSING_VI').length,
        noDomain: issues.filter((issue) => issue.kind === 'PROJECT_NO_DOMAIN').length,
        fewKeyFacts: issues.filter((issue) => issue.kind === 'CASE_STUDY_KEY_FACTS').length,
        marqueeCount,
        publishLint: issues.filter((issue) => issue.kind === 'PUBLISH_LINT').length,
      },
      issues,
    };
  }
}

function asText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function localePairs(
  row: object,
  fields: readonly string[],
): Array<{ name: string; en: string | null; vi: string | null }> {
  const record = row as Record<string, unknown>;
  return fields.map((name) => ({
    name: `${name}Vi`,
    en: asText(record[`${name}En`]),
    vi: asText(record[`${name}Vi`]),
  }));
}

function toStatusCounts(rows: StatusCountRow[]): ContentStatusCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const row of rows) {
    if (row.status === 'DRAFT') {
      counts.draft = row._count.id;
    }
    if (row.status === 'PUBLISHED') {
      counts.published = row._count.id;
    }
    if (row.status === 'ARCHIVED') {
      counts.archived = row._count.id;
    }
  }
  return counts;
}
