import { Injectable } from '@nestjs/common';
import type { Locale, PublicSiteSettings } from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { siteSettingsSelect } from './entities/site-settings.entity';
import { toPublicSiteSettings } from './entities/site-settings.mapper';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(locale: Locale): Promise<PublicSiteSettings> {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: siteSettingsSelect,
    });
    if (!row) {
      throw new NotSeededException('SiteSettings');
    }
    return toPublicSiteSettings(row, locale);
  }
}
