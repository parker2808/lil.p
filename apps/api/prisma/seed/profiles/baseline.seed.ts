import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedAbout } from '../data/about.data';
import { seedPages } from '../data/pages.data';
import { seedSite } from '../data/site.data';
import { seedWork } from '../data/work.data';

/**
 * Production first boot (PLAN D13). Projects stay DRAFT; 0 posts.
 */
export async function seedBaseline(prisma: PrismaClient): Promise<void> {
  await seedSite(prisma);
  await seedPages(prisma);
  await seedAbout(prisma);
  await seedWork(prisma, 'DRAFT');
}
