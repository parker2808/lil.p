import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@portfolio/contracts';

import type { RequestUser } from '../../modules/auth/strategies/jwt.strategy';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowed = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? ['admin'];

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const role = request.user?.role;
    if (!role || !allowed.includes(role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Forbidden',
      });
    }
    return true;
  }
}
