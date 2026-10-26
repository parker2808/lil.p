import { Injectable } from '@nestjs/common';
import type { Locale, PublicProfile } from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { profileSelect } from './entities/profile.entity';
import { toPublicProfile } from './entities/profile.mapper';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(locale: Locale): Promise<PublicProfile> {
    const row = await this.prisma.profile.findUnique({
      where: { id: 1 },
      select: profileSelect,
    });
    if (!row) {
      throw new NotSeededException('Profile');
    }
    return toPublicProfile(row, locale);
  }
}
