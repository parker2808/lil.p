import { Injectable } from '@nestjs/common';
import {
  type AdminHealth,
  type AdminHealthIssue,
  type AdminStats,
  type AdminViews,
  type ContentStatus,
  type ContentStatusCounts,
  parseBlock,
  PRISMA_PAGE_KEY_TO_PUBLIC,
  type StatsRange,
} from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { blockRefsOf, readPageSnapshot } from '../pages/page-snapshot.util';
import {
  lintFieldNames,
  missingViFieldNames,
  POST_LOCALE_FIELDS,
  PROJECT_LOCALE_FIELDS,
  splitFactLines,
} from './dashboard-health.util';
import { statsRangeWindow } from './dashboard-range.util';
import { asDay, asInt, emptyViews, mergeViewsByDay } from './dashboard-views.util';

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

    const [
      projectGroups,
      postGroups,
      projectInRange,
      projectPrev,
      postInRange,
      postPrev,
      unreadMessages,
      views,
    ] = await Promise.all([
      this.prisma.project.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.post.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.project.count({ where: publishedIn(periodStart, periodEnd) }),
      this.prisma.project.count({ where: publishedIn(previousStart, periodStart) }),
      this.prisma.post.count({ where: publishedIn(periodStart, periodEnd) }),
      this.prisma.post.count({ where: publishedIn(previousStart, periodStart) }),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.viewsForRange(periodStart, periodEnd, previousStart),
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
      messages: { unread: unreadMessages },
      views,
    };
  }

  private async viewsForRange(
    periodStart: Date,
    periodEnd: Date,
    previousStart: Date,
  ): Promise<AdminViews> {
    try {
      const [current, previous, byDayRows, topPages, topReferrers] = await Promise.all([
        this.prisma.pageView.aggregate({
          where: { createdAt: { gte: periodStart, lt: periodEnd } },
          _count: { id: true },
        }),
        this.prisma.pageView.aggregate({
          where: { createdAt: { gte: previousStart, lt: periodStart } },
          _count: { id: true },
        }),
        this.prisma.$queryRaw<Array<{ date: unknown; views: unknown; visitors: unknown }>>`
          SELECT DATE(createdAt) AS date,
                 COUNT(*) AS views,
                 COUNT(DISTINCT visitorHash) AS visitors
          FROM page_view
          WHERE createdAt >= ${periodStart} AND createdAt < ${periodEnd}
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
        `,
        this.prisma.pageView.groupBy({
          by: ['path'],
          where: { createdAt: { gte: periodStart, lt: periodEnd } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 8,
        }),
        this.prisma.pageView.groupBy({
          by: ['referrerHost'],
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
            referrerHost: { not: null },
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 8,
        }),
      ]);
      const uniqueCurrent = await this.prisma.pageView.findMany({
        where: { createdAt: { gte: periodStart, lt: periodEnd } },
        distinct: ['visitorHash'],
        select: { visitorHash: true },
      });
      const uniquePrevious = await this.prisma.pageView.findMany({
        where: { createdAt: { gte: previousStart, lt: periodStart } },
        distinct: ['visitorHash'],
        select: { visitorHash: true },
      });
      return {
        total: current._count.id,
        uniqueVisitors: uniqueCurrent.length,
        previousTotal: previous._count.id,
        previousUnique: uniquePrevious.length,
        byDay: mergeViewsByDay(
          byDayRows.map((row) => ({
            date: asDay(row.date),
            views: asInt(row.views),
            visitors: asInt(row.visitors),
          })),
          periodStart,
          periodEnd,
        ),
        topPages: topPages.map((row) => ({ path: row.path, views: row._count.id })),
        topReferrers: topReferrers.flatMap((row) =>
          row.referrerHost ? [{ host: row.referrerHost, views: row._count.id }] : [],
        ),
      };
    } catch {
      return emptyViews(periodStart, periodEnd);
    }
  }

  async getHealth(): Promise<AdminHealth> {
    const [projects, posts, marqueeCount, pages] = await Promise.all([
      this.prisma.project.findMany({
        where: { status: { not: 'ARCHIVED' } },
        select: PROJECT_HEALTH_SELECT,
      }),
      this.prisma.post.findMany({
        where: { status: { not: 'ARCHIVED' } },
        select: POST_HEALTH_SELECT,
      }),
      this.prisma.skill.count({ where: { showInMarquee: true, isVisible: true } }),
      this.prisma.page.findMany({
        include: {
          blocks: true,
          publishedVersion: true,
        },
      }),
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

    const missingAlt = await this.prisma.media.findMany({
      where: { mimeType: { startsWith: 'image/' }, altEn: '' },
      select: { id: true, originalName: true },
    });
    for (const row of missingAlt) {
      issues.push({
        kind: 'MISSING_ALT',
        entity: 'media',
        id: row.id,
        title: row.originalName,
        href: '/admin/media',
      });
    }

    const staleCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const refIds = { project: new Set<number>(), stat: new Set<number>() };
    const queuedRefs: Array<{
      pageId: number;
      title: string;
      href: string;
      kind: string;
      id: number;
      source: string;
    }> = [];

    for (const page of pages) {
      const title = PRISMA_PAGE_KEY_TO_PUBLIC[page.key];
      const href = `/admin/pages/${title}`;
      if (!page.publishedVersionId) {
        issues.push({
          kind: 'PAGE_NEVER_PUBLISHED',
          entity: 'page',
          id: page.id,
          title,
          href,
        });
      } else if (
        page.publishedAt &&
        page.updatedAt.getTime() > page.publishedAt.getTime() &&
        page.updatedAt.getTime() < staleCutoff
      ) {
        issues.push({
          kind: 'PAGE_STALE_DRAFT',
          entity: 'page',
          id: page.id,
          title,
          href,
        });
      }

      const draftInvalid: string[] = [];
      for (const block of page.blocks) {
        const parsed = parseBlock({
          id: block.id,
          type: block.type,
          key: block.key,
          layout: block.layout,
          surface: block.surface,
          schemaVersion: block.schemaVersion,
          props: block.props,
        });
        if (!parsed.ok) {
          draftInvalid.push(block.key);
        } else {
          for (const ref of blockRefsOf(block.type, parsed.block.props)) {
            if (ref.kind === 'project') {
              refIds.project.add(ref.id);
            }
            if (ref.kind === 'stat') {
              refIds.stat.add(ref.id);
            }
            queuedRefs.push({
              pageId: page.id,
              title,
              href,
              kind: ref.kind,
              id: ref.id,
              source: block.key,
            });
          }
        }
      }

      const snapshot = page.publishedVersion
        ? readPageSnapshot(page.publishedVersion.snapshot)
        : null;
      const publishedInvalid: string[] = [];
      if (snapshot) {
        for (const [index, block] of snapshot.blocks.entries()) {
          const parsed = parseBlock({
            id: index + 1,
            type: block.type,
            key: block.key,
            layout: block.layout,
            surface: block.surface,
            schemaVersion: block.schemaVersion,
            props: block.props,
          });
          if (!parsed.ok) {
            publishedInvalid.push(block.key);
          } else {
            for (const ref of blockRefsOf(block.type, parsed.block.props)) {
              if (ref.kind === 'project') {
                refIds.project.add(ref.id);
              }
              if (ref.kind === 'stat') {
                refIds.stat.add(ref.id);
              }
              queuedRefs.push({
                pageId: page.id,
                title,
                href,
                kind: ref.kind,
                id: ref.id,
                source: `published:${block.key}`,
              });
            }
          }
        }
      }

      const invalidFields = [...new Set([...draftInvalid, ...publishedInvalid])];
      if (invalidFields.length > 0) {
        issues.push({
          kind: 'PAGE_INVALID_BLOCKS',
          entity: 'page',
          id: page.id,
          title,
          href,
          fields: invalidFields,
        });
      }
    }

    const [projectRows, statRows] = await Promise.all([
      refIds.project.size > 0
        ? this.prisma.project.findMany({
            where: { id: { in: [...refIds.project] } },
            select: { id: true, status: true },
          })
        : [],
      refIds.stat.size > 0
        ? this.prisma.profileStat.findMany({
            where: { id: { in: [...refIds.stat] } },
            select: { id: true },
          })
        : [],
    ]);
    const projectById = new Map(projectRows.map((row) => [row.id, row]));
    const statSet = new Set(statRows.map((row) => row.id));
    const brokenByPage = new Map<number, string[]>();
    for (const ref of queuedRefs) {
      const ok =
        ref.kind === 'project'
          ? projectById.get(ref.id)?.status === 'PUBLISHED'
          : ref.kind === 'stat'
            ? statSet.has(ref.id)
            : true;
      if (!ok) {
        const fields = brokenByPage.get(ref.pageId) ?? [];
        fields.push(`${ref.source}:${ref.kind}:${ref.id}`);
        brokenByPage.set(ref.pageId, fields);
      }
    }
    for (const page of pages) {
      const fields = brokenByPage.get(page.id);
      if (!fields || fields.length === 0) {
        continue;
      }
      issues.push({
        kind: 'PAGE_BROKEN_REFS',
        entity: 'page',
        id: page.id,
        title: PRISMA_PAGE_KEY_TO_PUBLIC[page.key],
        href: `/admin/pages/${PRISMA_PAGE_KEY_TO_PUBLIC[page.key]}`,
        fields,
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
        missingAlt: missingAlt.length,
        neverPublished: issues.filter((issue) => issue.kind === 'PAGE_NEVER_PUBLISHED').length,
        staleDrafts: issues.filter((issue) => issue.kind === 'PAGE_STALE_DRAFT').length,
        invalidPageBlocks: issues.filter((issue) => issue.kind === 'PAGE_INVALID_BLOCKS').length,
        brokenRefs: issues.filter((issue) => issue.kind === 'PAGE_BROKEN_REFS').length,
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
