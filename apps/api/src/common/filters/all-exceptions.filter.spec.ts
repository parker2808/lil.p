import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { Prisma } from '../../generated/prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('maps a thrown Error to 500 INTERNAL with no stack', () => {
    const body = filter.toBody(new Error('secret stack'), 'req-1');
    expect(body).toEqual({
      statusCode: 500,
      code: 'INTERNAL',
      message: 'Something went wrong',
      requestId: 'req-1',
    });
    expect(JSON.stringify(body)).not.toMatch(/stack|secret/i);
  });

  it('maps Nest NotFoundException to 404 NOT_FOUND', () => {
    const body = filter.toBody(new NotFoundException('Cannot GET /api/missing'), 'req-2');
    expect(body.statusCode).toBe(404);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.requestId).toBe('req-2');
  });

  it('keeps VALIDATION_FAILED fieldErrors from the pipe', () => {
    const body = filter.toBody(
      new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { locale: ['Invalid option'] },
      }),
      'req-3',
    );
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.fieldErrors?.locale).toEqual(['Invalid option']);
  });

  it('maps Prisma P2002 to 409 CONFLICT', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['slug'] },
    });
    const body = filter.toBody(error, 'req-4');
    expect(body.statusCode).toBe(HttpStatus.CONFLICT);
    expect(body.code).toBe('CONFLICT');
    expect(body.fieldErrors?.slug).toEqual(['already exists']);
  });

  it('maps Prisma 7 adapter unique index names to the field', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the constraint: `project_slug_key`',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          modelName: 'Project',
          driverAdapterError: {
            cause: {
              kind: 'UniqueConstraintViolation',
              constraint: { index: 'project_slug_key' },
              originalMessage: "Duplicate entry 'sample-case' for key 'project.project_slug_key'",
            },
          },
        },
      },
    );
    expect(filter.toBody(error, 'req-4b').fieldErrors?.slug).toEqual(['already exists']);
  });

  it('maps Prisma P2025 to 404 NOT_FOUND', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Missing', {
      code: 'P2025',
      clientVersion: 'test',
    });
    expect(filter.toBody(error, 'req-5').code).toBe('NOT_FOUND');
  });

  it('maps a generic HttpException by status', () => {
    const body = filter.toBody(new HttpException('nope', HttpStatus.BAD_REQUEST), 'req-6');
    expect(body.code).toBe('VALIDATION_FAILED');
  });

  it('maps a 401 without a code to UNAUTHENTICATED', () => {
    const body = filter.toBody(new UnauthorizedException(), 'req-7');
    expect(body.statusCode).toBe(401);
    expect(body.code).toBe('UNAUTHENTICATED');
  });

  it('maps PayloadTooLarge to 400 VALIDATION_FAILED on file', () => {
    const body = filter.toBody(new PayloadTooLargeException('File too large'), 'req-10');
    expect(body.statusCode).toBe(400);
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.fieldErrors?.file).toEqual(['Must be 10 MB or smaller']);
  });

  it('maps a 403 without a code to FORBIDDEN and 429 to RATE_LIMITED', () => {
    expect(filter.toBody(new HttpException('no', HttpStatus.FORBIDDEN), 'req-8').code).toBe(
      'FORBIDDEN',
    );
    expect(
      filter.toBody(new HttpException('slow', HttpStatus.TOO_MANY_REQUESTS), 'req-9').code,
    ).toBe('RATE_LIMITED');
  });
});
