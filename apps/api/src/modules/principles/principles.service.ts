import { Injectable } from '@nestjs/common';
import type { Locale, PublicPrinciple } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { principleSelect } from './entities/principle.entity';
import { toPublicPrinciple } from './entities/principle.mapper';

@Injectable()
export class PrinciplesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicPrinciple[]> {
    const rows = await this.prisma.principle.findMany({
      where: { isVisible: true },
      select: principleSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicPrinciple(row, locale));
  }
}
