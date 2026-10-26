import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedAbout } from '../data/about.data';
import { seedPages } from '../data/pages.data';
import { seedSite } from '../data/site.data';

/**
 * Production first boot (PLAN D13). Later tasks keep projects as DRAFT
 * and skip sample posts.
 */
export async function seedBaseline(prisma: PrismaClient): Promise<void> {
  await seedSite(prisma);
  await seedPages(prisma);
  await seedAbout(prisma);
}
