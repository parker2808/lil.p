import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.FIXTURE_PORT ?? 4179);

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, ...devices['Desktop Chrome'] },
  webServer: {
    command: `pnpm preview -- --port ${port}`,
    url: `http://127.0.0.1:${port}/en/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
