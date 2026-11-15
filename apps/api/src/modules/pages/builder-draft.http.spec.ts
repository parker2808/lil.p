import type { INestApplication } from '@nestjs/common';
import {
  type CanActivate,
  ConflictException,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminPagesController } from './admin-pages.controller';
import { BuilderDraftService } from './builder-draft.service';
import { PageVersionsService } from './page-versions.service';
import { PagesService } from './pages.service';

class TestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string>; user?: { role: string } }>();
    const role = request.headers['x-test-role'];
    if (!role) throw new UnauthorizedException();
    request.user = { role };
    return true;
  }
}

describe('builder draft HTTP contract', () => {
  let app: INestApplication;
  const builder = {
    get: vi.fn(async () => ({ mode: 'legacy', revision: '0', tree: null })),
    activate: vi.fn(async () => {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'Reload',
        mode: 'tree',
        revision: '9007199254740993',
      });
    }),
    save: vi.fn(),
    publish: vi.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminPagesController],
      providers: [
        { provide: PagesService, useValue: {} },
        { provide: PageVersionsService, useValue: {} },
        { provide: BuilderDraftService, useValue: builder },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new TestGuard(), new RolesGuard(app.get(Reflector)));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => app?.close());

  it('requires authentication, allows user draft reads and denies user writes', async () => {
    const path = '/api/admin/pages/ideas/builder/draft';
    await request(app.getHttpServer()).get(path).expect(401);
    await request(app.getHttpServer()).get(path).set('x-test-role', 'user').expect(200);
    const denied = await request(app.getHttpServer())
      .put(path)
      .set('x-test-role', 'user')
      .send({ expectedRevision: '0', tree: {} })
      .expect(403);
    expect(denied.body.code).toBe('FORBIDDEN');
  });

  it('keeps revision conflicts in the standard envelope with the exact decimal string', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/pages/ideas/builder/activate')
      .set('x-test-role', 'admin')
      .send({ expectedRevision: '0', tree: {} })
      .expect(409);
    expect(response.body).toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
      mode: 'tree',
      revision: '9007199254740993',
      requestId: expect.any(String),
    });
  });

  it('rejects invalid revision strings and unknown DTO fields before mutation', async () => {
    for (const payload of [
      { expectedRevision: 0, tree: {} },
      { expectedRevision: '01', tree: {} },
      { expectedRevision: '0', tree: {}, unknown: true },
    ]) {
      const response = await request(app.getHttpServer())
        .post('/api/admin/pages/ideas/builder/activate')
        .set('x-test-role', 'admin')
        .send(payload)
        .expect(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    }
    expect(builder.activate).toHaveBeenCalledTimes(1);
  });
});
