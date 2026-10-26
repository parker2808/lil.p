import { Injectable, Logger } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(private readonly config: AppConfigService) {}

  async revalidate(tags: string[]): Promise<void> {
    const unique = [...new Set(tags.filter(Boolean))];
    const base = this.config.webInternalUrl;
    const secret = this.config.revalidateSecret;
    if (!base || !secret || unique.length === 0) {
      return;
    }

    const url = `${base.replace(/\/$/, '')}/api/revalidate`;
    const attempt = async (): Promise<void> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tags: unique }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    };

    try {
      await attempt();
    } catch (first) {
      try {
        await attempt();
      } catch (second) {
        this.logger.warn(
          `Revalidate failed for ${unique.join(',')}: ${String(second)} (after ${String(first)})`,
        );
      }
    }
  }
}
