import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedPages } from '../data/pages.data';
import { seedSite } from '../data/site.data';

/**
 * Dev / CI / screenshots. Later tasks add published projects and sample posts.
 * T08 only seeds the site layout tables (same rows as baseline for now).
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedSite(prisma);
  await seedPages(prisma);
}
