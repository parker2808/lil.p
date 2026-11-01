import { resolve } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import {
  localDatabaseUrl,
  testAnalyticsSalt,
  testJwtAccess,
  testJwtRefresh,
  testRevalidateSecret,
} from './e2e/helpers/secrets';

const apiPort = process.env.API_PORT ?? '4000';
const webPort = process.env.WEB_PORT ?? '3000';
const apiOrigin = `http://127.0.0.1:${apiPort}`;
const webOrigin = process.env.WEB_ORIGIN ?? `http://127.0.0.1:${webPort}`;
const databaseUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL ?? localDatabaseUrl();
const jwtAccess = process.env.JWT_ACCESS_SECRET ?? testJwtAccess();
const jwtRefresh = process.env.JWT_REFRESH_SECRET ?? testJwtRefresh();
const revalidateSecret = process.env.REVALIDATE_SECRET ?? testRevalidateSecret();

const sharedEnv = {
  ...process.env,
  API_HOST: '127.0.0.1',
  API_PORT: apiPort,
  API_URL: apiOrigin,
  WEB_ORIGIN: webOrigin,
  WEB_INTERNAL_URL: webOrigin,
  DATABASE_URL: databaseUrl,
  DATABASE_URL_TEST: databaseUrl,
  JWT_ACCESS_SECRET: jwtAccess,
  JWT_REFRESH_SECRET: jwtRefresh,
  REVALIDATE_SECRET: revalidateSecret,
  ANALYTICS_SALT_SECRET: process.env.ANALYTICS_SALT_SECRET ?? testAnalyticsSalt(),
  NEXT_PUBLIC_SITE_URL: webOrigin,
};

Object.assign(process.env, sharedEnv);

export default defineConfig({
  testDir: './e2e',
  testMatch: [
    'public.spec.ts',
    'redesign.spec.ts',
    'contact.spec.ts',
    'admin-publish.spec.ts',
    'admin-pages.spec.ts',
    'admin-save-status.spec.ts',
    'a11y.spec.ts',
    'lighthouse.spec.ts',
    'ux-overlay.spec.ts',
    'admin-scroll.spec.ts',
    'ux-404.spec.ts',
    'content-guard.spec.ts',
    'hero-shader.spec.ts',
    'admin-login.spec.ts',
    'segmented-control.spec.ts',
    'admin-tables.spec.ts',
    'admin-back-link.spec.ts',
    'url-view-state.spec.ts',
    'admin-table-styles.spec.ts',
  ],
  // Snapshots hold computed styles, not pixels, so one file serves every platform.
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.GITHUB_ACTIONS ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: webOrigin,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: resolve(import.meta.dirname, '../api'),
      url: `${apiOrigin}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...sharedEnv,
        NODE_ENV: 'test',
        DATABASE_URL: databaseUrl,
      },
    },
    {
      command: `pnpm exec next start --port ${webPort} --hostname 127.0.0.1`,
      url: `${webOrigin}/admin/login`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { ...sharedEnv, NODE_ENV: 'production' },
    },
  ],
});
