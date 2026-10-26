import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../../config/app-config.service';
import { UsersService } from '../../users/users.service';
import { REFRESH_COOKIE } from '../auth-cookies.util';
import type { RefreshPayload } from '../token.service';
import type { RequestUser } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: AppConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.[REFRESH_COOKIE] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.jwtRefreshSecret,
    });
  }

  async validate(payload: RefreshPayload): Promise<RequestUser> {
    const user = await this.users.findById(Number(payload.sub));
    if (!user || !user.isActive || payload.ver !== user.tokenVersion) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
      });
    }
    return { id: user.id, role: user.role };
  }
}
