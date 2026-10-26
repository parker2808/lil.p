import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorBody, ErrorCode } from '@portfolio/contracts';
import type { Request, Response } from 'express';

import { Prisma } from '../../generated/prisma/client';

type RequestWithId = Request & { requestId?: string };

/**
 * Turns every thrown error into the shared `{ statusCode, code, message, requestId }` body.
 * Prisma unique → 409, missing row → 404. Stacks stay in the log, never in the body.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();
    const requestId = request.requestId ?? 'unknown';

    const body = this.toBody(exception, requestId);

    if (body.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${body.code} ${requestId}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  toBody(exception: unknown, requestId: string): ApiErrorBody {
    if (exception instanceof HttpException) {
      return this.fromHttp(exception, requestId);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const target = exception.meta?.['target'];
        const field = Array.isArray(target) ? String(target[0]) : 'id';
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: 'A record with that value already exists',
          requestId,
          fieldErrors: { [field]: ['already exists'] },
        };
      }
      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Record not found',
          requestId,
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL',
      message: 'Something went wrong',
      requestId,
    };
  }

  private fromHttp(exception: HttpException, requestId: string): ApiErrorBody {
    const statusCode = exception.getStatus();
    const raw = exception.getResponse();

    if (typeof raw === 'object' && raw !== null && 'code' in raw) {
      const payload = raw as {
        code: ErrorCode;
        message?: string;
        fieldErrors?: Record<string, string[]>;
      };
      return {
        statusCode,
        code: payload.code,
        message: payload.message ?? exception.message,
        requestId,
        fieldErrors: payload.fieldErrors,
      };
    }

    const message =
      typeof raw === 'string'
        ? raw
        : typeof raw === 'object' && raw !== null && 'message' in raw
          ? Array.isArray((raw as { message: unknown }).message)
            ? ((raw as { message: string[] }).message[0] ?? exception.message)
            : String((raw as { message: unknown }).message)
          : exception.message;

    const code: ErrorCode =
      statusCode === HttpStatus.NOT_FOUND
        ? 'NOT_FOUND'
        : statusCode === HttpStatus.BAD_REQUEST
          ? 'VALIDATION_FAILED'
          : statusCode === HttpStatus.CONFLICT
            ? 'CONFLICT'
            : 'INTERNAL';

    return { statusCode, code, message, requestId };
  }
}
