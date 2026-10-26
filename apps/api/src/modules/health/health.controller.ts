import { Controller, Get } from '@nestjs/common';

/**
 * `@Controller('health')` + `@Get()` = GET /api/health
 * (the /api prefix is set once in main.ts).
 * Docker and uptime monitors will call this later (T58, T61).
 */
@Controller('health')
export class HealthController {
  @Get()
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
