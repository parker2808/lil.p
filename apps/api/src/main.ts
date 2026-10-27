import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger/setup-swagger';
import { AppConfigService } from './config/app-config.service';

/**
 * Bootstrap is the first file that runs. It:
 * 1. creates the Nest app from AppModule
 * 2. prefixes every route with /api
 * 3. serves Swagger UI at /api/docs outside production (/ redirects there)
 * 4. listens on 127.0.0.1 locally (D9) and 0.0.0.0:$PORT on Render (D28)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const expressApp = app.getHttpAdapter().getInstance() as {
    set: (k: string, v: string | number) => void;
  };
  const config = app.get(AppConfigService);
  // Render is hop 1. Vercel /api rewrites add hop 2. Throttler still keys on
  // the left-most X-Forwarded-For so each browser keeps its own budget.
  expressApp.set('trust proxy', config.isProduction ? 2 : 'loopback');
  if (config.corsOrigins.length > 0) {
    app.enableCors({ origin: config.corsOrigins, credentials: true });
  }
  app.setGlobalPrefix('api');
  if (!config.isProduction) {
    setupSwagger(app);
  }
  app.enableShutdownHooks();

  await app.listen(config.port, config.host);
}

void bootstrap();
