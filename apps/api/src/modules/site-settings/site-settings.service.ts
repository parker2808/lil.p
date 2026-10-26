import { Injectable } from '@nestjs/common';
import type {
  AdminSiteSettings,
  Locale,
  PublicSiteSettings,
  SiteSettingsUpdateInput,
} from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { siteSettingsSelect } from './entities/site-settings.entity';
import { toAdminDto, toPublicSiteSettings } from './entities/site-settings.mapper';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(locale: Locale): Promise<PublicSiteSettings> {
    return toPublicSiteSettings(await this.requireRow(), locale);
  }

  async getAdmin(): Promise<AdminSiteSettings> {
    return toAdminDto(await this.requireRow());
  }

  async update(input: SiteSettingsUpdateInput): Promise<AdminSiteSettings> {
    await this.requireRow();
    const data: Prisma.SiteSettingsUncheckedUpdateInput = { ...input };
    const row = await this.prisma.siteSettings.update({
      where: { id: 1 },
      data,
      select: siteSettingsSelect,
    });
    return toAdminDto(row);
  }

  private async requireRow() {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: siteSettingsSelect,
    });
    if (!row) {
      throw new NotSeededException('SiteSettings');
    }
    return row;
  }
}
