import { resolve } from 'node:path';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from 'dotenv';

import { PrismaClient } from '../../src/generated/prisma/client';
import { seedAdmin } from './data/admin.data';

config({ path: resolve(import.meta.dirname, '../../../../.env') });
config({ path: resolve(import.meta.dirname, '../../.env') });

/**
 * Creates or updates only the admin user from ADMIN_EMAIL / ADMIN_NAME /
 * ADMIN_PASSWORD. Unlike `db:seed`, it never touches content rows, so it is
 * safe after `db:reset` loaded the owner content migration.
 */
async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to seed the admin');
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_NAME || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD must all be set');
  }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

  try {
    await seedAdmin(prisma);
    console.log(`Admin ${process.env.ADMIN_EMAIL} is ready.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
