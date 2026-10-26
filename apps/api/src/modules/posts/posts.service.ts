import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Locale,
  PublicPostDetail,
  PublicPostListItem,
  PublicPostListQuery,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { postSelect } from './entities/post.entity';
import { toPublicPostDetail, toPublicPostListItem } from './entities/post.mapper';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale, query: PublicPostListQuery): Promise<PublicPostListItem[]> {
    const where: Prisma.PostWhereInput = { status: 'PUBLISHED' };
    if (query.tag) {
      where.tags = { some: { slug: query.tag } };
    }
    const rows = await this.prisma.post.findMany({
      where,
      select: postSelect,
      orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => toPublicPostListItem(row, locale));
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
