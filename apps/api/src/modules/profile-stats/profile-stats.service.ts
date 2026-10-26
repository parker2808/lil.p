import { Injectable } from '@nestjs/common';
import type { Locale, PublicProfileStat } from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { profileStatSelect } from './entities/profile-stat.entity';
import { toPublicProfileStat } from './entities/profile-stat.mapper';
import { resolveStatValue } from './resolve-profile-stat.util';

@Injectable()
export class ProfileStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicProfileStat[]> {
    const [profile, rows, publishedProjectCount] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { id: 1 },
        select: { careerStartDate: true },
      }),
      this.prisma.profileStat.findMany({
        where: { isVisible: true },
        select: profileStatSelect,
        orderBy: { sortOrder: 'asc' },
      }),
      this.countPublishedProjects(),
    ]);
    if (!profile) {
      throw new NotSeededException('Profile');
    }

    return rows.map((row) =>
      toPublicProfileStat(
        row,
        locale,
        resolveStatValue({
          source: row.source,
          value: row.value,
          careerStartDate: profile.careerStartDate,
          publishedProjectCount,
        }),
      ),
    );
  }

  /** T16 will count `Project` rows with `status: PUBLISHED`. */
  private async countPublishedProjects(): Promise<number> {
    return 0;
  }
}
