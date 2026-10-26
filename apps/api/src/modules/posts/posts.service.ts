import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Locale,
  PostListParams,
  PublicPostDetail,
  PublicPostListPage,
} from '@portfolio/contracts';
import { parseSort } from '@portfolio/contracts';

import { paginate } from '../../common/utils/paginate.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { postSelect } from './entities/post.entity';
import { toPublicPostDetail, toPublicPostListItem } from './entities/post.mapper';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale, query: PostListParams): Promise<PublicPostListPage> {
    const where: Prisma.PostWhereInput = { status: 'PUBLISHED' };
    if (query.tag) {
      where.tags = { some: { slug: query.tag } };
    }
    if (query.q) {
      where.OR = [{ titleEn: { contains: query.q } }, { titleVi: { contains: query.q } }];
    }

    const { field, direction } = parseSort(query.sort);
    const orderBy: Prisma.PostOrderByWithRelationInput[] = [
      { [field]: direction } as Prisma.PostOrderByWithRelationInput,
      { id: 'asc' },
    ];
    const { skip, take } = paginate(query.page, query.pageSize);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({ where, select: postSelect, orderBy, skip, take }),
    ]);

    return {
      items: rows.map((row) => toPublicPostListItem(row, locale)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getPublic(slug: string, locale: Locale): Promise<PublicPostDetail> {
    const row = await this.prisma.post.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: postSelect,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Post ${slug} was not found` });
    }
    return toPublicPostDetail(row, locale);
  }
}
