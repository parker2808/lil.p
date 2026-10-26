import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminProject,
  AdminProjectListItem,
  AdminProjectListPage,
  AdminProjectListParams,
  Locale,
  ProjectCreateInput,
  ProjectListParams,
  ProjectUpdateInput,
  PublicProjectDetail,
  PublicProjectListPage,
} from '@portfolio/contracts';
import { parseSort } from '@portfolio/contracts';

import { paginate } from '../../common/utils/paginate.util';
import { reorder } from '../../common/utils/reorder.util';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { projectSelect } from './entities/project.entity';
import {
  toAdminDto,
  toAdminListItem,
  toPublicProjectDetail,
  toPublicProjectListItem,
} from './entities/project.mapper';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale, query: ProjectListParams): Promise<PublicProjectListPage> {
    const where: Prisma.ProjectWhereInput = { status: 'PUBLISHED' };
    if (query.featured === '1' || query.featured === 'true') {
      where.isFeatured = true;
    }
    if (query.domain) {
      where.domain = { slug: query.domain };
    }
    if (query.skill) {
      where.skills = { some: { slug: query.skill } };
    }
    if (query.q) {
      where.OR = [{ titleEn: { contains: query.q } }, { titleVi: { contains: query.q } }];
    }

    const { field, direction } = parseSort(query.sort);
    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
      { [field]: direction } as Prisma.ProjectOrderByWithRelationInput,
      { id: 'asc' },
    ];
    const { skip, take } = paginate(query.page, query.pageSize);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        select: projectSelect,
        orderBy,
        skip,
        take,
      }),
    ]);

    return {
      items: rows.map((row) => toPublicProjectListItem(row, locale)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getPublic(slug: string, locale: Locale): Promise<PublicProjectDetail> {
    const row = await this.prisma.project.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: projectSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Project ${slug} was not found`,
      });
    }
    return toPublicProjectDetail(row, locale);
  }

  async listAdmin(query: AdminProjectListParams): Promise<AdminProjectListPage> {
    const where: Prisma.ProjectWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.domain) {
      where.domain = { slug: query.domain };
    }
    if (query.q) {
      where.OR = [
        { titleEn: { contains: query.q } },
        { titleVi: { contains: query.q } },
        { slug: { contains: query.q } },
      ];
    }
    const { field, direction } = parseSort(query.sort);
    const { skip, take } = paginate(query.page, query.pageSize);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        select: projectSelect,
        orderBy: [{ [field]: direction } as Prisma.ProjectOrderByWithRelationInput, { id: 'asc' }],
        skip,
        take,
      }),
    ]);
    return {
      items: rows.map(toAdminListItem),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async reorder(ids: number[]): Promise<AdminProjectListItem[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).project, ids);
    const rows = await this.prisma.project.findMany({
      select: projectSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminListItem);
  }

  async getAdmin(id: number): Promise<AdminProject> {
    const row = await this.findRow(id);
    return toAdminDto(row);
  }

  async create(input: ProjectCreateInput): Promise<AdminProject> {
    const row = await this.prisma.project.create({
      data: {
        ...this.toWriteData(input),
        status: 'DRAFT',
        skills: input.skillIds ? { connect: input.skillIds.map((id) => ({ id })) } : undefined,
        metrics: input.metrics
          ? {
              create: input.metrics.map((metric, index) => ({
                labelEn: metric.labelEn,
                labelVi: metric.labelVi,
                before: metric.before ?? null,
                after: metric.after ?? null,
                value: metric.value,
                sortOrder: metric.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      select: projectSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: ProjectUpdateInput): Promise<AdminProject> {
    const current = await this.findRow(id);
    if (input.updatedAt && current.updatedAt.getTime() !== new Date(input.updatedAt).getTime()) {
      throw new ConflictException({
        code: 'STALE',
        message: 'This project was saved by someone else',
      });
    }

    const { skillIds, metrics, updatedAt, status, ...fields } = input;
    void updatedAt;
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          ...this.toWriteData(fields),
          ...(status !== undefined ? { status } : {}),
        },
      });
      if (skillIds) {
        await tx.project.update({
          where: { id },
          data: { skills: { set: skillIds.map((skillId) => ({ id: skillId })) } },
        });
      }
      if (metrics) {
        await tx.projectMetric.deleteMany({ where: { projectId: id } });
        if (metrics.length > 0) {
          await tx.projectMetric.createMany({
            data: metrics.map((metric, index) => ({
              projectId: id,
              labelEn: metric.labelEn,
              labelVi: metric.labelVi,
              before: metric.before ?? null,
              after: metric.after ?? null,
              value: metric.value,
              sortOrder: metric.sortOrder ?? index,
            })),
          });
        }
      }
      return tx.project.findUniqueOrThrow({ where: { id }, select: projectSelect });
    });
    return toAdminDto(row);
  }

  async archive(id: number): Promise<AdminProject> {
    await this.findRow(id);
    const row = await this.prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      select: projectSelect,
    });
    return toAdminDto(row);
  }

  private async findRow(id: number) {
    const row = await this.prisma.project.findUnique({
      where: { id },
      select: projectSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Project ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(
    input: Partial<ProjectCreateInput>,
  ): Prisma.ProjectUncheckedUpdateInput & Prisma.ProjectUncheckedCreateInput {
    const data: Prisma.ProjectUncheckedUpdateInput & Record<string, unknown> = {};
    const assign = <K extends keyof ProjectCreateInput>(key: K, value: ProjectCreateInput[K]) => {
      data[key as string] = value;
    };

    if (input.slug !== undefined) assign('slug', input.slug);
    if (input.titleEn !== undefined) assign('titleEn', input.titleEn);
    if (input.titleVi !== undefined) assign('titleVi', input.titleVi);
    if (input.taglineEn !== undefined) assign('taglineEn', input.taglineEn);
    if (input.taglineVi !== undefined) assign('taglineVi', input.taglineVi);
    if (input.client !== undefined) assign('client', input.client);
    if (input.roleEn !== undefined) assign('roleEn', input.roleEn);
    if (input.roleVi !== undefined) assign('roleVi', input.roleVi);
    if (input.teamSize !== undefined) data.teamSize = input.teamSize;
    if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.versionFrom !== undefined) data.versionFrom = input.versionFrom;
    if (input.versionTo !== undefined) data.versionTo = input.versionTo;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.isConfidential !== undefined) data.isConfidential = input.isConfidential;
    if (input.liveUrl !== undefined) data.liveUrl = input.liveUrl;
    if (input.repoUrl !== undefined) data.repoUrl = input.repoUrl;
    if (input.problemEn !== undefined) assign('problemEn', input.problemEn);
    if (input.problemVi !== undefined) assign('problemVi', input.problemVi);
    if (input.constraintsEn !== undefined) assign('constraintsEn', input.constraintsEn);
    if (input.constraintsVi !== undefined) assign('constraintsVi', input.constraintsVi);
    if (input.approachEn !== undefined) assign('approachEn', input.approachEn);
    if (input.approachVi !== undefined) assign('approachVi', input.approachVi);
    if (input.decisionsEn !== undefined) assign('decisionsEn', input.decisionsEn);
    if (input.decisionsVi !== undefined) assign('decisionsVi', input.decisionsVi);
    if (input.outcomeEn !== undefined) assign('outcomeEn', input.outcomeEn);
    if (input.outcomeVi !== undefined) assign('outcomeVi', input.outcomeVi);
    if (input.lessonsEn !== undefined) assign('lessonsEn', input.lessonsEn);
    if (input.lessonsVi !== undefined) assign('lessonsVi', input.lessonsVi);
    if (input.keyFactsEn !== undefined) assign('keyFactsEn', input.keyFactsEn);
    if (input.keyFactsVi !== undefined) assign('keyFactsVi', input.keyFactsVi);
    if (input.factChipsEn !== undefined) assign('factChipsEn', input.factChipsEn);
    if (input.factChipsVi !== undefined) assign('factChipsVi', input.factChipsVi);
    if (input.notMineEn !== undefined) data.notMineEn = input.notMineEn;
    if (input.notMineVi !== undefined) data.notMineVi = input.notMineVi;
    if (input.releaseStatus !== undefined) {
      data.releaseStatus = input.releaseStatus === null ? Prisma.JsonNull : input.releaseStatus;
    }
    if (input.seoTitleEn !== undefined) data.seoTitleEn = input.seoTitleEn;
    if (input.seoTitleVi !== undefined) data.seoTitleVi = input.seoTitleVi;
    if (input.seoDescriptionEn !== undefined) data.seoDescriptionEn = input.seoDescriptionEn;
    if (input.seoDescriptionVi !== undefined) data.seoDescriptionVi = input.seoDescriptionVi;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.coverId !== undefined) data.coverId = input.coverId;
    if (input.domainId !== undefined) data.domainId = input.domainId;
    if (input.experienceId !== undefined) data.experienceId = input.experienceId;
    return data as Prisma.ProjectUncheckedUpdateInput & Prisma.ProjectUncheckedCreateInput;
  }
}
