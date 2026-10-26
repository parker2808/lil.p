import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminProcessStep,
  Locale,
  ProcessStepCreateInput,
  ProcessStepUpdateInput,
  PublicProcessStep,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { processStepSelect } from './entities/process-step.entity';
import { toAdminDto, toPublicProcessStep } from './entities/process-step.mapper';

@Injectable()
export class ProcessStepsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicProcessStep[]> {
    const rows = await this.prisma.processStep.findMany({
      where: { isVisible: true },
      select: processStepSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicProcessStep(row, locale));
  }

  async listAdmin(): Promise<AdminProcessStep[]> {
    const rows = await this.prisma.processStep.findMany({
      select: processStepSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async getAdmin(id: number): Promise<AdminProcessStep> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: ProcessStepCreateInput): Promise<AdminProcessStep> {
    const row = await this.prisma.processStep.create({
      data: this.toWriteData(input) as Prisma.ProcessStepUncheckedCreateInput,
      select: processStepSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: ProcessStepUpdateInput): Promise<AdminProcessStep> {
    await this.findRow(id);
    const row = await this.prisma.processStep.update({
      where: { id },
      data: this.toWriteData(input),
      select: processStepSelect,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminProcessStep> {
    const current = await this.findRow(id);
    await this.prisma.processStep.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.processStep.findUnique({
      where: { id },
      select: processStepSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Process step ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(
    input: Partial<ProcessStepCreateInput>,
  ): Prisma.ProcessStepUncheckedUpdateInput {
    const data: Prisma.ProcessStepUncheckedUpdateInput = {};
    if (input.titleEn !== undefined) data.titleEn = input.titleEn;
    if (input.titleVi !== undefined) data.titleVi = input.titleVi;
    if (input.captionEn !== undefined) data.captionEn = input.captionEn;
    if (input.captionVi !== undefined) data.captionVi = input.captionVi;
    if (input.iconKey !== undefined) data.iconKey = input.iconKey;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    return data;
  }
}
