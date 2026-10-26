import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Locale,
  ProjectListParams,
  PublicProjectDetail,
  PublicProjectListPage,
} from '@portfolio/contracts';
import { parseSort } from '@portfolio/contracts';

import { paginate } from '../../common/utils/paginate.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { projectSelect } from './entities/project.entity';
import { toPublicProjectDetail, toPublicProjectListItem } from './entities/project.mapper';

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
}
