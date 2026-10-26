import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import type { PrismaClient } from '../../src/generated/prisma/client';

const apiRoot = resolve(import.meta.dirname, '../..');

export function migrateTestDb(): void {
  const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL_TEST is required for e2e tests');
  }
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}

export async function truncateTables(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME <> '_prisma_migrations'
  `;
  if (rows.length < 1) {
    return;
  }
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0`);
    for (const row of rows) {
      await tx.$executeRawUnsafe(`DELETE FROM \`${row.TABLE_NAME}\``);
    }
    await tx.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1`);
  });
}
