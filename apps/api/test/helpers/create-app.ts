import { resolve } from 'node:path';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

import { AppModule } from '../../src/app.module';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

const TEST_ACCESS_SECRET = 'test-access-secret-at-least-32-chars!!';
const TEST_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!';

export async function createTestApp(): Promise<INestApplication> {
  process.env.NODE_ENV = 'test';
  process.env.API_PORT ??= '4001';
  process.env.API_HOST ??= '127.0.0.1';
  process.env.WEB_ORIGIN ??= 'http://localhost:3000';
  process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
  process.env.JWT_REFRESH_SECRET = TEST_REFRESH_SECRET;
  process.env.ANALYTICS_SALT_SECRET ??= 'test-analytics-salt-secret!!';
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  app.use(cookieParser());
  const expressApp = app.getHttpAdapter().getInstance() as { set: (k: string, v: string) => void };
  expressApp.set('trust proxy', 'loopback');
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}
