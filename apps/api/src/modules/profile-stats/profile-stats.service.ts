import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminProfileStat,
  Locale,
  ProfileStatCreateInput,
  ProfileStatUpdateInput,
  PublicProfileStat,
} from '@portfolio/contracts';

import { NotSeededException } from '../../common/errors/not-seeded.exception';
import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { profileStatSelect } from './entities/profile-stat.entity';
import { toAdminDto, toPublicProfileStat } from './entities/profile-stat.mapper';
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

  async listAdmin(): Promise<AdminProfileStat[]> {
    const rows = await this.prisma.profileStat.findMany({
      select: profileStatSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminProfileStat[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).profileStat, ids);
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminProfileStat> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: ProfileStatCreateInput): Promise<AdminProfileStat> {
    const row = await this.prisma.profileStat.create({
      data: this.toWriteData(input) as Prisma.ProfileStatUncheckedCreateInput,
      select: profileStatSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: ProfileStatUpdateInput): Promise<AdminProfileStat> {
    await this.findRow(id);
    const row = await this.prisma.profileStat.update({
      where: { id },
      data: this.toWriteData(input),
      select: profileStatSelect,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminProfileStat> {
    const current = await this.findRow(id);
    await this.prisma.profileStat.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async countPublishedProjects(): Promise<number> {
    return this.prisma.project.count({ where: { status: 'PUBLISHED' } });
  }

  private async findRow(id: number) {
    const row = await this.prisma.profileStat.findUnique({
      where: { id },
      select: profileStatSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Profile stat ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(
    input: Partial<ProfileStatCreateInput>,
  ): Prisma.ProfileStatUncheckedUpdateInput {
    const data: Prisma.ProfileStatUncheckedUpdateInput = {};
    if (input.labelEn !== undefined) data.labelEn = input.labelEn;
    if (input.labelVi !== undefined) data.labelVi = input.labelVi;
    if (input.value !== undefined) data.value = input.value;
    if (input.suffix !== undefined) data.suffix = input.suffix;
    if (input.source !== undefined) data.source = input.source;
    if (input.iconKey !== undefined) data.iconKey = input.iconKey;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    return data;
  }
}
