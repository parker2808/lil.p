import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

/**
 * `@Controller('health')` + `@Get()` = GET /api/health
 * (the /api prefix is set once in main.ts).
 * Docker and uptime monitors will call this later (T58, T61).
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(): Promise<{ status: 'ok'; db: 'ok' }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'ok' };
  }
}
