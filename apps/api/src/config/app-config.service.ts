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
}
