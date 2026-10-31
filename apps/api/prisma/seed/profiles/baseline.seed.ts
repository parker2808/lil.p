import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedOwner } from './owner.seed';

/**
 * Production first boot (PLAN D13, spec §1.5). Loads the owner's portfolio
 * JSON via `seedOwner`: projects are PUBLISHED, 0 posts, no demo inbox messages
 * or page views. Contact stays `<email>` / `<phone>` until Parker edits in
 * `/admin` (T60).
 */
export async function seedBaseline(prisma: PrismaClient): Promise<void> {
  await seedOwner(prisma);
}
