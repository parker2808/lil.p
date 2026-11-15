import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';

import shared from '../../../../playwright.config';

export default defineConfig({
  ...shared,
  testDir: resolve(import.meta.dirname, '../../../../e2e'),
  testMatch: ['cms-builder-canvas.spec.ts', 'cms-builder-keyboard.spec.ts'],
  globalSetup: resolve(import.meta.dirname, '../../../../e2e/global-setup.ts'),
  webServer: (Array.isArray(shared.webServer)
    ? shared.webServer
    : shared.webServer
      ? [shared.webServer]
      : []
  ).map((server, index) => ({
    ...server,
    cwd: index === 1 ? resolve(import.meta.dirname, '../../../..') : server.cwd,
    env: { ...server.env, R3_E2E_STATES: '1' },
  })),
});
