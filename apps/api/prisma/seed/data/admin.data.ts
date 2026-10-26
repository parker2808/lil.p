import * as argon2 from 'argon2';

import type { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Creates the first admin only when ADMIN_EMAIL, ADMIN_NAME and
 * ADMIN_PASSWORD are all set. Never invents a default password.
 */
export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !name || !password) {
    return;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'admin' },
    update: { name, passwordHash, role: 'admin', isActive: true },
  });
}
