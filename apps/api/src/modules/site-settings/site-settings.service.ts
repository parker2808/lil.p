import { Injectable, Optional } from '@nestjs/common';
import type {
  AdminSiteSettings,
  Locale,
  PublicSiteSettings,
  SiteSettingsUpdateInput,
} from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PublishingService } from '../publishing/publishing.service';
import { SITE_TAGS } from '../publishing/tags.util';
import { siteSettingsSelect } from './entities/site-settings.entity';
import { toAdminDto, toPublicSiteSettings } from './entities/site-settings.mapper';

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
    @Optional() private readonly audit?: AuditService,
  ) {}

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
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'site-settings',
      entityId: 1,
      summary: 'Updated site settings',
    });
    void this.publishing?.revalidate([...SITE_TAGS]);
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
