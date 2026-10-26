import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Locale,
  PublicProjectDetail,
  PublicProjectListItem,
  PublicProjectListQuery,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { projectSelect } from './entities/project.entity';
import { toPublicProjectDetail, toPublicProjectListItem } from './entities/project.mapper';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(
    locale: Locale,
    query: PublicProjectListQuery,
  ): Promise<PublicProjectListItem[]> {
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

    const rows = await this.prisma.project.findMany({
      where,
      select: projectSelect,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => toPublicProjectListItem(row, locale));
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
