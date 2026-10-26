import { Injectable } from '@nestjs/common';
import type { Locale, PublicEducation } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { educationSelect } from './entities/education.entity';
import { toPublicEducation } from './entities/education.mapper';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicEducation[]> {
    const rows = await this.prisma.education.findMany({
      where: { isVisible: true },
      select: educationSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicEducation(row, locale));
  }
}
