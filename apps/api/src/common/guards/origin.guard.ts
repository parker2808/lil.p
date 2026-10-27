import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AppConfigService } from '../../config/app-config.service';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!MUTATING.has(request.method)) {
      return true;
    }
    // Same-origin browser calls through the Vercel /api rewrite send
    // Origin = WEB_ORIGIN (the Vercel host), not the Render API host.
    if (request.headers.origin !== this.config.webOrigin) {
      throw new ForbiddenException({
        code: 'BAD_ORIGIN',
        message: 'Invalid origin',
      });
    }
    return true;
  }
}
