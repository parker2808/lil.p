import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@portfolio/contracts';

import { AppConfigService } from '../../config/app-config.service';

export type AccessPayload = { sub: string; role: Role };
export type RefreshPayload = { sub: string; ver: number };

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  signAccess(user: { id: number; role: Role }): Promise<string> {
    const payload: AccessPayload = { sub: String(user.id), role: user.role };
    return this.jwt.signAsync(payload, {
      secret: this.config.jwtAccessSecret,
      expiresIn: this.config.jwtAccessTtlSeconds,
      algorithm: 'HS256',
    });
  }

  signRefresh(user: { id: number; tokenVersion: number }): Promise<string> {
    const payload: RefreshPayload = { sub: String(user.id), ver: user.tokenVersion };
    return this.jwt.signAsync(payload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: this.config.jwtRefreshTtlSeconds,
      algorithm: 'HS256',
    });
  }
}
