import { Controller, Get } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * `@Controller('health')` + `@Get()` = GET /api/health
 * (the /api prefix is set once in main.ts).
 * Docker and uptime monitors will call this later (T58, T61).
 */
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(): Promise<{ status: 'ok'; db: 'ok' }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'ok' };
  }
}
