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
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminPagesController } from './admin-pages.controller';
import { PageVersionsService } from './page-versions.service';
import { PagesService } from './pages.service';

class MockAuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { role: string };
    }>();
    const role = req.headers['x-test-role'];
    if (!role) throw new UnauthorizedException();
    req.user = { role };
    return true;
  }
}

describe('POST /api/admin/pages (mock HTTP)', () => {
  let app: INestApplication;
  let calls: unknown[] = [];
  let duplicate = false;
  const createPage = async (input: unknown) => {
    calls.push(input);
    if (duplicate) {
      throw new ConflictException({
        code: 'PAGE_KEY_TAKEN',
        message: 'Page slug is already in use',
      });
    }
    const page = input as { template: string };
    return {
      ...page,
      blocks: page.template === 'starter' ? [{ type: 'page-header' }, { type: 'prose' }] : [],
    };
  };
  const body = { title: 'Ideas', key: 'ideas', locale: 'en', template: 'starter' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminPagesController],
      providers: [
        { provide: PagesService, useValue: { createPage } },
        { provide: PageVersionsService, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new MockAuthenticationGuard(), new RolesGuard(app.get(Reflector)));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  beforeEach(() => {
    calls = [];
    duplicate = false;
  });

  afterAll(async () => app?.close());

  it('rejects unauthenticated and non-admin users before calling the service', async () => {
    await request(app.getHttpServer()).post('/api/admin/pages').send(body).expect(401);
    const forbidden = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'user')
      .send(body)
      .expect(403);
    expect(forbidden.body.code).toBe('FORBIDDEN');
    expect(calls).toHaveLength(0);
  });

  it('returns field errors for a malformed payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/pages')
      .set('x-test-role', 'admin')
      .send({ ...body, title: '', key: 'bad_slug' })
      .expect(400);
    expect(response.body.code).toBe('VALIDATION_FAILED');
    expect(response.body.fieldErrors).toMatchObject({
      title: expect.any(Array),
      key: expect.any(Array),
    });
    expect(calls).toHaveLength(0);
  });

  it('maps a reserved or duplicate slug to 409', async () => {
    duplicate = true;
    for (const key of ['craft', 'ideas']) {
      const response = await request(app.getHttpServer())
        .post('/api/admin/pages')
        .set('x-test-role', 'admin')
        .send({ ...body, key });
      expect(response.status).toBe(409);
      expect(response.body.code).toBe('PAGE_KEY_TAKEN');
    }
  });

  it.each(['starter', 'empty'] as const)(
    'posts the %s template and returns the page',
    async (template) => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/pages')
        .set('x-test-role', 'admin')
        .send({ ...body, template, locale: template === 'empty' ? 'vi' : 'en' })
        .expect(201);
      expect(calls).toContainEqual(
        expect.objectContaining({ template, locale: template === 'empty' ? 'vi' : 'en' }),
      );
      expect(response.body.blocks).toHaveLength(template === 'starter' ? 2 : 0);
    },
  );
});
