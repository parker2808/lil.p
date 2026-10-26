import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { adminAgent, createTestUsers, userAgent } from './helpers/auth.helper';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n');
const EXE = Buffer.from('MZ\x90\x00this is not a jpeg');

describe('media uploads', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let users: UsersService;

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    users = app.get(UsersService);
  });

  beforeEach(async () => {
    await truncateTables(prisma);
    await createTestUsers(users);
  });

  afterAll(async () => {
    await app.close();
  });

  it('uploads a JPEG with srcset and lets an admin patch alt', async () => {
    const admin = await adminAgent(app);
    const created = await admin
      .post('/api/admin/media')
      .attach('file', JPEG, { filename: 'cover.jpg', contentType: 'image/jpeg' })
      .expect(201);
    expect(created.body.mimeType).toBe('image/jpeg');
    expect(created.body.srcset).toContain('480w');
    expect(created.body.srcset).toContain('f=webp');
    expect(created.body.url).toContain(created.body.fileName);

    const patched = await admin
      .patch(`/api/admin/media/${created.body.id}`)
      .send({ altEn: 'Cover photo', altVi: 'Anh bia' })
      .expect(200);
    expect(patched.body.altEn).toBe('Cover photo');

    const listed = await admin.get('/api/admin/media').expect(200);
    expect(listed.body.items).toHaveLength(1);
    expect(listed.body.nextCursor).toBeNull();

    const pub = await request(app.getHttpServer())
      .get(`/api/public/media/${created.body.fileName}`)
      .expect(302);
    expect(pub.headers.location).toContain(created.body.fileName);
    expect(pub.headers['x-content-type-options']).toBe('nosniff');
  });

  it('accepts a PDF without variants', async () => {
    const admin = await adminAgent(app);
    const created = await admin
      .post('/api/admin/media')
      .attach('file', PDF, { filename: 'resume.pdf', contentType: 'application/pdf' })
      .expect(201);
    expect(created.body.mimeType).toBe('application/pdf');
    expect(created.body.srcset).toBe('');
    expect(created.body.width).toBeNull();
  });

  it('rejects an exe renamed to jpg and a 20 MB upload', async () => {
    const admin = await adminAgent(app);
    const spoofed = await admin
      .post('/api/admin/media')
      .attach('file', EXE, { filename: 'cover.jpg', contentType: 'image/jpeg' })
      .expect(400);
    expect(spoofed.body.code).toBe('VALIDATION_FAILED');

    const huge = Buffer.alloc(20 * 1024 * 1024, 0xff);
    huge[0] = 0xff;
    huge[1] = 0xd8;
    huge[2] = 0xff;
    const oversized = await admin
      .post('/api/admin/media')
      .attach('file', huge, { filename: 'big.jpg', contentType: 'image/jpeg' })
      .expect(400);
    expect(oversized.body.code).toBe('VALIDATION_FAILED');
    expect(oversized.body.fieldErrors.file).toBeDefined();
  });

  it('forbids a user from uploading and returns 409 when the file is in use', async () => {
    const admin = await adminAgent(app);
    const user = await userAgent(app);
    await user
      .post('/api/admin/media')
      .attach('file', JPEG, { filename: 'cover.jpg', contentType: 'image/jpeg' })
      .expect(403);

    const created = await admin
      .post('/api/admin/media')
      .attach('file', JPEG, { filename: 'cover.jpg', contentType: 'image/jpeg' })
      .expect(201);
    await user.get('/api/admin/media').expect(200);

    await prisma.project.create({
      data: {
        slug: 'with-cover',
        titleEn: 'Covered',
        titleVi: '',
        taglineEn: 't',
        taglineVi: '',
        client: 'c',
        roleEn: 'r',
        roleVi: '',
        startDate: new Date('2024-01-01'),
        problemEn: '',
        problemVi: '',
        constraintsEn: '',
        constraintsVi: '',
        approachEn: '',
        approachVi: '',
        decisionsEn: '',
        decisionsVi: '',
        outcomeEn: '',
        outcomeVi: '',
        lessonsEn: '',
        lessonsVi: '',
        keyFactsEn: '',
        keyFactsVi: '',
        factChipsEn: '',
        factChipsVi: '',
        coverId: created.body.id,
      },
    });
    const blocked = await admin.delete(`/api/admin/media/${created.body.id}`).expect(409);
    expect(blocked.body.code).toBe('IN_USE');
  });
});
