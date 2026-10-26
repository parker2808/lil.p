import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * Typed getters so the rest of the app never reads `process.env` directly.
 * Nest injects this service wherever you list it in a constructor.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get port(): number {
    return this.config.get('API_PORT', { infer: true });
  }

  get host(): string {
    return this.config.get('API_HOST', { infer: true });
  }

  get webOrigin(): string {
    return this.config.get('WEB_ORIGIN', { infer: true });
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get databaseUrl(): string {
    if (this.nodeEnv === 'test') {
      return (
        this.config.get('DATABASE_URL_TEST', { infer: true }) ??
        this.config.get('DATABASE_URL', { infer: true })
      );
    }
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get prismaLogQueries(): boolean {
    return this.config.get('PRISMA_LOG_QUERIES', { infer: true });
  }

  get jwtAccessSecret(): string {
    return this.config.get('JWT_ACCESS_SECRET', { infer: true });
  }

  get jwtRefreshSecret(): string {
    return this.config.get('JWT_REFRESH_SECRET', { infer: true });
  }

  get jwtAccessTtlSeconds(): number {
    return this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true });
  }

  get jwtRefreshTtlSeconds(): number {
    return this.config.get('JWT_REFRESH_TTL_SECONDS', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get cloudinary(): { cloudName: string; apiKey: string; apiSecret: string } | null {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME', { infer: true });
    const apiKey = this.config.get('CLOUDINARY_API_KEY', { infer: true });
    const apiSecret = this.config.get('CLOUDINARY_API_SECRET', { infer: true });
    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }
    return { cloudName, apiKey, apiSecret };
  }

  get webInternalUrl(): string | null {
    return this.config.get('WEB_INTERNAL_URL', { infer: true }) ?? null;
  }

  get revalidateSecret(): string | null {
    return this.config.get('REVALIDATE_SECRET', { infer: true }) ?? null;
  }
}
