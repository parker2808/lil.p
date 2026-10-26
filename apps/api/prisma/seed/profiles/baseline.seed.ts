import type { PrismaClient } from '../../../src/generated/prisma/client';
import { seedOwner } from './owner.seed';

/**
 * Production first boot (PLAN D13). Loads the owner's portfolio JSON.
 * Projects stay DRAFT; 0 posts.
 */
export async function seedBaseline(prisma: PrismaClient): Promise<void> {
  await seedOwner(prisma);
}
