import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import type { AdminProfile, Locale, ProfileUpdateInput, PublicProfile } from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PublishingService } from '../publishing/publishing.service';
import { SITE_TAGS } from '../publishing/tags.util';
import { profileSelect } from './entities/profile.entity';
import { toAdminDto, toPublicProfile } from './entities/profile.mapper';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async getPublic(locale: Locale): Promise<PublicProfile> {
    return toPublicProfile(await this.requireRow(), locale);
  }

  async getAdmin(): Promise<AdminProfile> {
    return toAdminDto(await this.requireRow());
  }

  async update(input: ProfileUpdateInput): Promise<AdminProfile> {
    const current = await this.requireRow();
    this.assertAccent(
      input.headlineEn ?? current.headlineEn,
      input.headlineAccentEn !== undefined ? input.headlineAccentEn : current.headlineAccentEn,
      'headlineAccentEn',
    );
    this.assertAccent(
      input.headlineVi ?? current.headlineVi,
      input.headlineAccentVi !== undefined ? input.headlineAccentVi : current.headlineAccentVi,
      'headlineAccentVi',
    );

    const data: Prisma.ProfileUncheckedUpdateInput = {};
    if (input.displayName !== undefined) data.displayName = input.displayName;
    if (input.legalName !== undefined) data.legalName = input.legalName;
    if (input.city !== undefined) data.city = input.city;
    if (input.country !== undefined) data.country = input.country;
    if (input.timezone !== undefined) data.timezone = input.timezone;
    if (input.careerStartDate !== undefined) data.careerStartDate = new Date(input.careerStartDate);
    if (input.headlineEn !== undefined) data.headlineEn = input.headlineEn;
    if (input.headlineVi !== undefined) data.headlineVi = input.headlineVi;
    if (input.subheadlineEn !== undefined) data.subheadlineEn = input.subheadlineEn;
    if (input.subheadlineVi !== undefined) data.subheadlineVi = input.subheadlineVi;
    if (input.bioEn !== undefined) data.bioEn = input.bioEn;
    if (input.bioVi !== undefined) data.bioVi = input.bioVi;
    if (input.languagesEn !== undefined) data.languagesEn = input.languagesEn;
    if (input.languagesVi !== undefined) data.languagesVi = input.languagesVi;
    if (input.heroKickerEn !== undefined) data.heroKickerEn = input.heroKickerEn;
    if (input.heroKickerVi !== undefined) data.heroKickerVi = input.heroKickerVi;
    if (input.headlineAccentEn !== undefined) data.headlineAccentEn = input.headlineAccentEn;
    if (input.headlineAccentVi !== undefined) data.headlineAccentVi = input.headlineAccentVi;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.avatarId !== undefined) data.avatarId = input.avatarId;
    if (input.resumeEnId !== undefined) data.resumeEnId = input.resumeEnId;
    if (input.resumeViId !== undefined) data.resumeViId = input.resumeViId;

    const row = await this.prisma.profile.update({
      where: { id: 1 },
      data,
      select: profileSelect,
    });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'profile',
      entityId: 1,
      summary: 'Updated profile',
    });
    void this.publishing?.revalidate([...SITE_TAGS]);
    return toAdminDto(row);
  }

  private assertAccent(headline: string, accent: string | null, field: string): void {
    if (accent && !headline.includes(accent)) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { [field]: ['Must appear in the headline'] },
      });
    }
  }

  private async requireRow() {
    const row = await this.prisma.profile.findUnique({
      where: { id: 1 },
      select: profileSelect,
    });
    if (!row) {
      throw new NotSeededException('Profile');
    }
    return row;
  }
}
