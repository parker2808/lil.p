import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { profileData, siteSettingsData } from '../prisma/seed/data/site.data';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

describe('health', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok when the database answers', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', db: 'ok' });
  });

  it('rejects an unknown public locale', async () => {
    await prisma.siteSettings.create({ data: { id: 1, ...siteSettingsData } });
    await prisma.profile.create({ data: { id: 1, ...profileData } });

    const res = await request(app.getHttpServer()).get('/api/public/site?locale=fr').expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors.locale).toBeDefined();
  });

  it('returns the public site shell after seed rows exist', async () => {
    await prisma.siteSettings.create({ data: { id: 1, ...siteSettingsData } });
    await prisma.profile.create({ data: { id: 1, ...profileData } });

    const res = await request(app.getHttpServer()).get('/api/public/site?locale=en').expect(200);
    expect(res.body.profile.displayName).toBe(profileData.displayName);
    expect(res.body.settings.siteName).toBe(siteSettingsData.siteName);
    expect(res.body.settings.contactEmail).toBe('<email>');
  });
});
