import { resolve } from 'node:path';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from 'dotenv';

import { PrismaClient } from '../../src/generated/prisma/client';
import { seedAdmin } from './data/admin.data';
import { seedBaseline } from './profiles/baseline.seed';
import { seedDemo } from './profiles/demo.seed';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const profile =
  process.env.SEED_PROFILE === 'baseline' || process.env.SEED_PROFILE === 'owner'
    ? 'baseline'
    : 'demo';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to seed');
  }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

  try {
    if (profile === 'baseline') {
      await seedBaseline(prisma);
    } else {
      await seedDemo(prisma);
    }
    await seedAdmin(prisma);
    console.log(`Seeded ${profile} profile.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
