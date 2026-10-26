import { Injectable } from '@nestjs/common';
import type { TrackViewInput } from '@portfolio/contracts';
import type { Request } from 'express';

import { requestIp } from '../../common/utils/ip-hash.util';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  deviceFromUa,
  isBotUa,
  isPublicViewPath,
  referrerHost,
  visitorHash,
} from './analytics.util';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async track(body: TrackViewInput, req: Request): Promise<void> {
    const salt = this.config.analyticsSaltSecret;
    if (!salt) {
      return;
    }
    const settings = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { analyticsEnabled: true, domain: true },
    });
    if (!settings?.analyticsEnabled) {
      return;
    }
    const ua = String(req.headers['user-agent'] ?? '');
    if (isBotUa(ua) || !isPublicViewPath(body.path)) {
      return;
    }
    await this.prisma.pageView.create({
      data: {
        path: body.path,
        locale: body.locale,
        referrerHost: referrerHost(body.referrer, settings.domain),
        device: deviceFromUa(ua),
        visitorHash: visitorHash(requestIp(req), ua, salt),
      },
    });
  }
}
