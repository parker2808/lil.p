import { Injectable } from '@nestjs/common';
import type { Locale, PublicTag } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { tagSelect } from './entities/tag.entity';
import { toPublicTag } from './entities/tag.mapper';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicTag[]> {
    const rows = await this.prisma.tag.findMany({
      select: tagSelect,
      orderBy: { slug: 'asc' },
    });
    return rows.map((row) => toPublicTag(row, locale));
  }
}
