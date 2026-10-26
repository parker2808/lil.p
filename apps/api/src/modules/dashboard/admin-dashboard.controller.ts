import { Controller, Get, Query } from '@nestjs/common';
import {
  type AdminHealth,
  type AdminStats,
  type StatsQuery,
  statsQuerySchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DashboardService } from './dashboard.service';

@Controller('admin')
@Roles('admin', 'user')
export class AdminDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  stats(@Query(new ZodValidationPipe(statsQuerySchema)) query: StatsQuery): Promise<AdminStats> {
    return this.dashboard.getStats(query.range);
  }

  @Get('health')
  health(): Promise<AdminHealth> {
    return this.dashboard.getHealth();
  }
}
