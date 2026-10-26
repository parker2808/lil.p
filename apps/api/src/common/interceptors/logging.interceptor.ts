import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { finalize, type Observable } from 'rxjs';

type RequestWithId = Request & { requestId?: string };

/**
 * One line per request: method, path, status, ms, request id.
 * Never logs bodies, passwords, cookies, or emails.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();
    const started = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const ms = Date.now() - started;
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} ${ms}ms ${request.requestId ?? '-'}`,
        );
      }),
    );
  }
}
