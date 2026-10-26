import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Verifies the access_token cookie. T36 registers this globally and honors
 * `@Public()`; T35 applies it only on GET /auth/me.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
      });
    }
    return user;
  }
}
