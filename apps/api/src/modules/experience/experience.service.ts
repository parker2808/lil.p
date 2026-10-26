import { Injectable } from '@nestjs/common';
import type { Locale, PublicExperience } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { experienceSelect } from './entities/experience.entity';
import { toPublicExperience } from './entities/experience.mapper';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicExperience[]> {
    const rows = await this.prisma.experience.findMany({
      where: { isVisible: true },
      select: experienceSelect,
      orderBy: [{ startDate: 'desc' }, { sortOrder: 'asc' }],
    });
    return rows.map((row) => toPublicExperience(row, locale));
  }
}
