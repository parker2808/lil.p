import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../src/generated/prisma/client';

const key = process.argv[2];
const databaseUrl = process.env.DATABASE_URL_TEST;
if (!key || !/^metadata-invalid-[a-z0-9-]+$/.test(key) || !databaseUrl) {
  throw new Error('Disposable invalid-preview fixture requires a test page key and database');
}
const database = new URL(databaseUrl);
if (
  database.protocol !== 'mysql:' ||
  database.hostname !== '127.0.0.1' ||
  database.port !== '3307' ||
  database.pathname !== '/portfolio_test'
) {
  throw new Error('Invalid-preview fixture may only write to the disposable local test database');
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl!) });
  try {
    const page = await prisma.page.findUniqueOrThrow({
      where: { key: key! },
      include: { blocks: true },
    });
    const block = page.blocks.find((entry) => entry.type === 'prose');
    if (!block || !page.publishedVersionId) {
      throw new Error('Expected a published starter page with a draft prose block');
    }
    await prisma.pageBlock.update({
      where: { id: block.id },
      data: { type: 'f4-internal-legacy-type' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
