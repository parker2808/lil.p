import { resolve } from 'node:path';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from 'dotenv';

import { PrismaClient } from '../../src/generated/prisma/client';
import { seedBaseline } from './profiles/baseline.seed';
import { seedDemo } from './profiles/demo.seed';

config({ path: resolve(import.meta.dirname, '../../../../.env') });
config({ path: resolve(import.meta.dirname, '../../../.env') });

const profile = process.env.SEED_PROFILE === 'baseline' ? 'baseline' : 'demo';

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
    console.log(`Seeded ${profile} profile.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
