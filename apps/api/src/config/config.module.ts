import { join } from 'node:path';

import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service';
import { envSchema } from './env.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      // Repo-root `.env` first (docker / local), then `apps/api/.env`.
      envFilePath: [join(__dirname, '../../../../.env'), join(process.cwd(), '../../.env'), '.env'],
      validate: (raw) => envSchema.parse(raw),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
