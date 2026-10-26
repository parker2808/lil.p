import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Locale, PageKey, PublicPage } from '@portfolio/contracts';
import { PAGE_KEY_TO_PRISMA } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { pageWithBlocksInclude } from './entities/page.entity';
import { toPublicPage } from './entities/page.mapper';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPublic(key: PageKey, locale: Locale, requestId = 'unknown'): Promise<PublicPage> {
    const row = await this.prisma.page.findUnique({
      where: { key: PAGE_KEY_TO_PRISMA[key] },
      include: pageWithBlocksInclude,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${key} was not found` });
    }

    return toPublicPage(row, locale, ({ blockId, type, reason }) => {
      this.logger.warn(
        `Dropped block ${blockId} type=${type} page=${key} reason=${reason} ${requestId}`,
      );
    });
  }
}
