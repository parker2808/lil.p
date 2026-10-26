import { Injectable } from '@nestjs/common';
import type { Locale, PublicProcessStep } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { processStepSelect } from './entities/process-step.entity';
import { toPublicProcessStep } from './entities/process-step.mapper';

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
}
