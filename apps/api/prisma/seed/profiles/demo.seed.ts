import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedAbout } from '../data/about.data';
import { seedPages } from '../data/pages.data';
import { seedSite } from '../data/site.data';

/**
 * Dev / CI / screenshots. Later tasks add published projects and sample posts.
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedSite(prisma);
  await seedPages(prisma);
  await seedAbout(prisma);
}
