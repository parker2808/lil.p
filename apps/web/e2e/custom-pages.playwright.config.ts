import { resolve } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { testRevalidateSecret } from './helpers/secrets';

const origin = 'http://localhost:3000';
const secret = testRevalidateSecret();
process.env.CUSTOM_PAGE_MOCK_API = '1';

export default defineConfig({
  testDir: '.',
  testMatch: 'custom-public-pages.spec.ts',
  globalSetup: './helpers/clear-custom-page-cache.ts',
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 15_000 },
  use: { baseURL: origin, viewport: { width: 1440, height: 900 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node helpers/custom-pages-mock-api.mjs',
      url: 'http://127.0.0.1:4000/api/health',
      reuseExistingServer: false,
      env: { ...process.env, REVALIDATE_SECRET: secret },
    },
    {
      command: 'pnpm exec next start --port 3000 --hostname 127.0.0.1',
      cwd: resolve(import.meta.dirname, '..'),
      url: `${origin}/admin/login`,
      reuseExistingServer: false,
      env: {
        ...process.env,
        CUSTOM_PAGE_MOCK_API: '1',
        REVALIDATE_SECRET: secret,
        NEXT_PUBLIC_SITE_URL: origin,
      },
    },
  ],
});
