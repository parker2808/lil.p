import { readFileSync } from 'node:fs';

import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { seedDemo } from '../prisma/seed/profiles/demo.seed';
import { seedOwner } from '../prisma/seed/profiles/owner.seed';
import {
  buildContentMigration,
  MIGRATION_SQL_PATH,
  splitSqlStatements,
} from '../scripts/build-content-migration';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers/create-app';
import { migrateTestDb, truncateTables } from './helpers/reset-db';

async function joinCount(
  prisma: PrismaService,
  table: '_ExperienceToSkill' | '_ProjectToSkill',
): Promise<Array<{ c: number | bigint }>> {
  return prisma.$queryRawUnsafe(`SELECT COUNT(*) AS c FROM \`${table}\``);
}

function experienceSkillCount(prisma: PrismaService) {
  return joinCount(prisma, '_ExperienceToSkill');
}

function projectSkillCount(prisma: PrismaService) {
  return joinCount(prisma, '_ProjectToSkill');
}

async function applyContentSql(prisma: PrismaService): Promise<void> {
  const statements = splitSqlStatements(readFileSync(MIGRATION_SQL_PATH, 'utf8'));
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

describe('portfolio content migration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const { counts } = buildContentMigration();

  beforeAll(async () => {
    migrateTestDb();
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await truncateTables(prisma);
    await applyContentSql(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies owner content counts on a fresh migrate deploy', async () => {
    expect(await prisma.siteSettings.count()).toBe(counts.site_settings);
    expect(await prisma.profile.count()).toBe(counts.profile);
    expect(await prisma.navItem.count()).toBe(counts.nav_item);
    expect(await prisma.socialLink.count()).toBe(counts.social_link);
    expect(await prisma.contactTopic.count()).toBe(counts.contact_topic);
    expect(await prisma.skillCategory.count()).toBe(counts.skill_category);
    expect(await prisma.skill.count()).toBe(counts.skill);
    expect(await prisma.experience.count()).toBe(counts.experience);
    expect(await prisma.education.count()).toBe(counts.education);
    expect(await prisma.principle.count()).toBe(counts.principle);
    expect(await prisma.profileStat.count()).toBe(counts.profile_stat);
    expect(await prisma.processStep.count()).toBe(counts.process_step);
    expect(await prisma.domain.count()).toBe(counts.domain);
    expect(await prisma.project.count()).toBe(counts.project);
    expect(await prisma.projectMetric.count()).toBe(counts.project_metric);
    expect(await prisma.page.count()).toBe(counts.page);
    expect(await prisma.pageBlock.count()).toBe(counts.page_block);
    expect(Number((await experienceSkillCount(prisma))[0]?.c)).toBe(counts._ExperienceToSkill);
    expect(Number((await projectSkillCount(prisma))[0]?.c)).toBe(counts._ProjectToSkill);

    const projects = await prisma.project.findMany({
      select: { slug: true, status: true, isConfidential: true },
    });
    expect(projects).toHaveLength(10);
    expect(projects.every((project) => project.status === 'DRAFT')).toBe(true);
    expect(projects.find((project) => project.slug === 'ctrack-crystal')?.isConfidential).toBe(
      true,
    );
    expect(projects.find((project) => project.slug === 'lil-p')?.isConfidential).toBe(false);
    expect(await prisma.user.count()).toBe(0);
  });

  it('is idempotent and does not wipe an existing user', async () => {
    const keepEmail = ['keep-me', 'example.com'].join('@');
    await prisma.user.create({
      data: {
        email: keepEmail,
        name: 'Keep Me',
        passwordHash: 'not-a-real-hash',
        role: 'admin',
      },
    });
    await applyContentSql(prisma);

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.user.findUnique({ where: { email: keepEmail } })).toBeTruthy();
    expect(await prisma.project.count()).toBe(counts.project);
    expect(await prisma.navItem.count()).toBe(counts.nav_item);
    expect(Number((await experienceSkillCount(prisma))[0]?.c)).toBe(counts._ExperienceToSkill);
    expect(Number((await projectSkillCount(prisma))[0]?.c)).toBe(counts._ProjectToSkill);
  });

  it('still accepts the demo seed after migrate', async () => {
    await seedDemo(prisma);
    const demo = await prisma.project.findUnique({ where: { slug: 'particula' } });
    expect(demo?.titleEn).toBe('Particula v2');
    expect(demo?.status).toBe('PUBLISHED');
    expect(
      await prisma.user.findUnique({ where: { email: ['keep-me', 'example.com'].join('@') } }),
    ).toBeTruthy();
    expect(await prisma.navItem.findFirst({ where: { labelEn: 'Work' } })).toBeTruthy();
    expect(await prisma.navItem.findFirst({ where: { labelEn: 'Home' } })).toBeNull();
    const home = await prisma.page.findUnique({
      where: { key: 'HOME' },
      include: { publishedVersion: true },
    });
    expect(JSON.stringify(home?.publishedVersion?.snapshot)).toContain('Featured case study');
    expect(JSON.stringify(home?.publishedVersion?.snapshot)).not.toContain('Featured work');
  });

  it('still accepts the owner seed after migrate', async () => {
    await seedOwner(prisma);
    expect(await prisma.project.count()).toBe(counts.project);
    expect(await prisma.project.findUnique({ where: { slug: 'lil-p' } })).toMatchObject({
      status: 'DRAFT',
      isConfidential: false,
    });
    expect(await prisma.post.count()).toBe(0);
    expect(
      await prisma.user.findUnique({ where: { email: ['keep-me', 'example.com'].join('@') } }),
    ).toBeTruthy();
    const profile = await prisma.profile.findUnique({ where: { id: 1 } });
    expect(profile?.phone).toBe('<phone>');
    const site = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    expect(site?.contactEmail).toBe('<email>');
  });
});
