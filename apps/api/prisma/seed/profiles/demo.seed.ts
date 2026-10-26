import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedAbout } from '../data/about.data';
import { seedPages } from '../data/pages.data';
import { seedSite } from '../data/site.data';
import { seedSkills } from '../data/skills.data';
import { seedWork } from '../data/work.data';

/**
 * Dev / CI / screenshots. Projects are PUBLISHED so public pages have cards.
 */
export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await seedSite(prisma);
  await seedPages(prisma);
  await seedAbout(prisma);
  await seedWork(prisma, 'PUBLISHED');
  await seedSkills(prisma);
}
