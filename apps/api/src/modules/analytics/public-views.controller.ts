import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { type TrackViewInput, trackViewSchema } from '@portfolio/contracts';
import type { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { ViewsThrottleGuard } from '../../common/guards/login-throttle.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

@Public()
@Controller('public/views')
export class PublicViewsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(ViewsThrottleGuard)
  track(
    @Body(new ZodValidationPipe(trackViewSchema)) body: TrackViewInput,
    @Req() req: Request,
  ): Promise<void> {
    return this.analytics.track(body, req);
  }
}
