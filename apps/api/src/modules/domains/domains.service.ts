import { Injectable } from '@nestjs/common';
import type { Locale, PublicDomain } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { domainSelect } from './entities/domain.entity';
import { toPublicDomain } from './entities/domain.mapper';

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicDomain[]> {
    const rows = await this.prisma.domain.findMany({
      where: { isVisible: true },
      select: domainSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicDomain(row, locale));
  }
}
