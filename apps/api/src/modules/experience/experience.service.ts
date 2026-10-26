import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminExperience,
  ExperienceCreateInput,
  ExperienceUpdateInput,
  Locale,
  PublicExperience,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import { assertFresh } from '../../common/utils/stale.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { experienceSelect } from './entities/experience.entity';
import { toAdminDto, toPublicExperience } from './entities/experience.mapper';

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

  async listAdmin(): Promise<AdminExperience[]> {
    const rows = await this.prisma.experience.findMany({
      select: experienceSelect,
      orderBy: [{ startDate: 'desc' }, { sortOrder: 'asc' }],
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminExperience[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).experience, ids);
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminExperience> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: ExperienceCreateInput): Promise<AdminExperience> {
    const row = await this.prisma.experience.create({
      data: {
        company: input.company,
        companyUrl: input.companyUrl,
        location: input.location,
        employmentType: input.employmentType,
        roleEn: input.roleEn,
        roleVi: input.roleVi,
        summaryEn: input.summaryEn,
        summaryVi: input.summaryVi,
        highlightsEn: input.highlightsEn,
        highlightsVi: input.highlightsVi,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
        skills: input.skillIds ? { connect: input.skillIds.map((id) => ({ id })) } : undefined,
      },
      select: experienceSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: ExperienceUpdateInput): Promise<AdminExperience> {
    const current = await this.findRow(id);
    assertFresh(current.updatedAt, input.updatedAt);
    const { skillIds, updatedAt, ...fields } = input;
    void updatedAt;
    const row = await this.prisma.experience.update({
      where: { id },
      data: {
        ...this.toWriteData(fields),
        ...(skillIds ? { skills: { set: skillIds.map((skillId) => ({ id: skillId })) } } : {}),
      },
      select: experienceSelect,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminExperience> {
    const current = await this.findRow(id);
    await this.prisma.experience.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.experience.findUnique({
      where: { id },
      select: experienceSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Experience ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(
    input: Partial<ExperienceCreateInput>,
  ): Prisma.ExperienceUncheckedUpdateInput {
    const data: Prisma.ExperienceUncheckedUpdateInput = {};
    if (input.company !== undefined) data.company = input.company;
    if (input.companyUrl !== undefined) data.companyUrl = input.companyUrl;
    if (input.location !== undefined) data.location = input.location;
    if (input.employmentType !== undefined) data.employmentType = input.employmentType;
    if (input.roleEn !== undefined) data.roleEn = input.roleEn;
    if (input.roleVi !== undefined) data.roleVi = input.roleVi;
    if (input.summaryEn !== undefined) data.summaryEn = input.summaryEn;
    if (input.summaryVi !== undefined) data.summaryVi = input.summaryVi;
    if (input.highlightsEn !== undefined) data.highlightsEn = input.highlightsEn;
    if (input.highlightsVi !== undefined) data.highlightsVi = input.highlightsVi;
    if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    return data;
  }
}
