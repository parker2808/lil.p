import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { profileData, siteSettingsData } from '../prisma/seed/data/site.data';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

describe('admin site shell', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: UsersService;
  let agent: import('supertest').Agent;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(users);
    agent = await adminAgent(app);
    await prisma.siteSettings.create({ data: { id: 1, ...siteSettingsData } });
    await prisma.profile.create({ data: { id: 1, ...profileData } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('patches site settings', async () => {
    const res = await agent.patch('/api/admin/site').send({ siteName: 'parker.test' }).expect(200);
    expect(res.body.siteName).toBe('parker.test');
    expect(res.body.contactEmail).toBe('<email>');
  });

  it('returns 400 fieldErrors for an invalid profile PATCH', async () => {
    const res = await agent.patch('/api/admin/profile').send({ displayName: '' }).expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.fieldErrors.displayName).toBeDefined();
  });

  it('rejects an accent that is not part of the headline for that locale only', async () => {
    const en = await agent
      .patch('/api/admin/profile')
      .send({
        headlineEn: 'I move products forward without breaking them.',
        headlineAccentEn: 'not in the line',
      })
      .expect(400);
    expect(en.body.fieldErrors.headlineAccentEn).toBeDefined();
    expect(en.body.fieldErrors.headlineAccentVi).toBeUndefined();

    const vi = await agent
      .patch('/api/admin/profile')
      .send({
        headlineVi: 'Tôi đưa sản phẩm tiến lên.',
        headlineAccentVi: 'không có',
      })
      .expect(400);
    expect(vi.body.fieldErrors.headlineAccentVi).toBeDefined();
    expect(vi.body.fieldErrors.headlineAccentEn).toBeUndefined();
  });

  it('rejects a nav href that is not a public route or https URL', async () => {
    const res = await agent
      .post('/api/admin/navigation')
      .send({
        location: 'HEADER',
        labelEn: 'Bad',
        labelVi: '',
        href: '/admin',
      })
      .expect(400);
    expect(res.body.fieldErrors.href).toBeDefined();
  });

  it('allows a public route or an https href', async () => {
    await agent
      .post('/api/admin/navigation')
      .send({
        location: 'HEADER',
        labelEn: 'Work',
        labelVi: '',
        href: '/projects',
      })
      .expect(201);

    await agent
      .post('/api/admin/navigation')
      .send({
        location: 'FOOTER',
        labelEn: 'Source',
        labelVi: '',
        href: 'https://github.com/parker2808/lil.p',
      })
      .expect(201);
  });

  it('limits CTA social links to two', async () => {
    await agent
      .post('/api/admin/social-links')
      .send({
        kind: 'GITHUB',
        labelEn: 'GitHub',
        labelVi: '',
        url: 'https://github.com/example',
        showInCta: true,
      })
      .expect(201);
    await agent
      .post('/api/admin/social-links')
      .send({
        kind: 'LINKEDIN',
        labelEn: 'LinkedIn',
        labelVi: '',
        url: 'https://www.linkedin.com/in/example',
        showInCta: true,
      })
      .expect(201);

    const third = await agent
      .post('/api/admin/social-links')
      .send({
        kind: 'OTHER',
        labelEn: 'Extra',
        labelVi: '',
        url: 'https://example.com',
        showInCta: true,
      })
      .expect(400);
    expect(third.body.fieldErrors.showInCta).toBeDefined();
  });

  it('lists visible contact topics in order on the public route', async () => {
    await agent
      .post('/api/admin/contact-topics')
      .send({ slug: 'role', labelEn: 'A role', labelVi: 'Một vai trò', sortOrder: 1 })
      .expect(201);
    await agent
      .post('/api/admin/contact-topics')
      .send({ slug: 'hidden', labelEn: 'Hidden', labelVi: '', sortOrder: 0, isVisible: false })
      .expect(201);
    await agent
      .post('/api/admin/contact-topics')
      .send({ slug: 'other', labelEn: 'Something else', labelVi: 'Khác', sortOrder: 2 })
      .expect(201);

    const res = await agent.get('/api/public/contact-topics?locale=en').expect(200);
    expect(res.body.map((item: { slug: string }) => item.slug)).toEqual(['role', 'other']);
  });
});
