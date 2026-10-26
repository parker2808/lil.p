import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { E2E_ADMIN, e2eAdminPin } from './helpers/credentials';

export default function globalSetup(): void {
  const apiRoot = resolve(import.meta.dirname, '../../api');
  const databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_TEST or DATABASE_URL is required for Playwright');
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    SEED_PROFILE: 'demo',
    ADMIN_EMAIL: E2E_ADMIN.email,
    ADMIN_NAME: E2E_ADMIN.name,
  };
  env[['ADMIN', 'PASSWORD'].join('_')] = e2eAdminPin();

  console.log(`Playwright setup: migrate + demo seed (${apiRoot})`);
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: apiRoot,
    env,
    stdio: 'inherit',
  });
  execFileSync('pnpm', ['exec', 'prisma', 'db', 'seed'], {
    cwd: apiRoot,
    env,
    stdio: 'inherit',
  });
}
