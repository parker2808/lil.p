import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { auditActor } from './audit-actor.store';

@Injectable()
export class AuditActorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    auditActor.enterWith({ userId: request.user?.id ?? null });
    return next.handle();
  }
}
