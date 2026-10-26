import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Role } from '@portfolio/contracts';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../../config/app-config.service';
import { ACCESS_COOKIE } from '../auth-cookies.util';
import type { AccessPayload } from '../token.service';

export type RequestUser = { id: number; role: Role };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.[ACCESS_COOKIE] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
  }

  validate(payload: AccessPayload): RequestUser {
    return { id: Number(payload.sub), role: payload.role };
  }
}
