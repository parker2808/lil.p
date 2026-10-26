import { resolve } from 'node:path';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { config } from 'dotenv';

import { AppModule } from '../../src/app.module';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

export async function createTestApp(): Promise<INestApplication> {
  process.env.NODE_ENV = 'test';
  process.env.API_PORT ??= '4001';
  process.env.API_HOST ??= '127.0.0.1';
  process.env.WEB_ORIGIN ??= 'http://localhost:3000';
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}
