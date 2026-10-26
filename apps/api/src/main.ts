import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

/**
 * Bootstrap is the first file that runs. It:
 * 1. creates the Nest app from AppModule
 * 2. prefixes every route with /api
 * 3. listens only on 127.0.0.1 until auth guards exist (PLAN D9)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const config = app.get(AppConfigService);
  await app.listen(config.port, config.host);
}

void bootstrap();
