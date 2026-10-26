import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Repo-root `.env` first (docker / local), then `apps/api/.env`.
config({ path: resolve(import.meta.dirname, '../../.env') });
config({ path: resolve(import.meta.dirname, '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/seed.ts',
  },
  datasource: {
    // TiDB Cloud needs TLS: append ?sslaccept=strict to DATABASE_URL (D28).
    url: process.env['DATABASE_URL'],
  },
});
