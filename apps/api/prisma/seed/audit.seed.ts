import { resolve } from 'node:path';

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@portfolio/contracts';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from 'dotenv';

import { PrismaClient } from '../../src/generated/prisma/client';

config({ path: resolve(import.meta.dirname, '../../../../.env') });
config({ path: resolve(import.meta.dirname, '../../../.env') });

const TOTAL = 5_000;

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to seed audit rows');
  }

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    });
    const data = Array.from({ length: TOTAL }, (_, index) => {
      const action = AUDIT_ACTIONS[index % AUDIT_ACTIONS.length] ?? 'UPDATE';
      const entityType = AUDIT_ENTITY_TYPES[index % AUDIT_ENTITY_TYPES.length] ?? 'project';
      return {
        userId: admin?.id ?? null,
        action,
        entityType,
        entityId: String((index % 200) + 1),
        summary: `Seed audit row ${index + 1}`,
      };
    });

    const chunk = 500;
    for (let offset = 0; offset < data.length; offset += chunk) {
      await prisma.auditLog.createMany({ data: data.slice(offset, offset + chunk) });
    }
    console.log(`Inserted ${TOTAL} audit rows.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
