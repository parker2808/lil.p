import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminEducation,
  EducationCreateInput,
  EducationUpdateInput,
  Locale,
  PublicEducation,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { educationSelect } from './entities/education.entity';
import { toAdminDto, toPublicEducation } from './entities/education.mapper';

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

  async listAdmin(): Promise<AdminEducation[]> {
    const rows = await this.prisma.education.findMany({
      select: educationSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminEducation[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).education, ids);
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminEducation> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: EducationCreateInput): Promise<AdminEducation> {
    const row = await this.prisma.education.create({
      data: this.toWriteData(input) as Prisma.EducationUncheckedCreateInput,
      select: educationSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: EducationUpdateInput): Promise<AdminEducation> {
    await this.findRow(id);
    const row = await this.prisma.education.update({
      where: { id },
      data: this.toWriteData(input),
      select: educationSelect,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminEducation> {
    const current = await this.findRow(id);
    await this.prisma.education.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.education.findUnique({
      where: { id },
      select: educationSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Education ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(input: Partial<EducationCreateInput>): Prisma.EducationUncheckedUpdateInput {
    const data: Prisma.EducationUncheckedUpdateInput = {};
    if (input.school !== undefined) data.school = input.school;
    if (input.degreeEn !== undefined) data.degreeEn = input.degreeEn;
    if (input.degreeVi !== undefined) data.degreeVi = input.degreeVi;
    if (input.majorEn !== undefined) data.majorEn = input.majorEn;
    if (input.majorVi !== undefined) data.majorVi = input.majorVi;
    if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = new Date(input.endDate);
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    return data;
  }
}
