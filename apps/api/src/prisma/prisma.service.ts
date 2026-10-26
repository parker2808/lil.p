import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { AppConfigService } from '../config/app-config.service';
import { PrismaClient } from '../generated/prisma/client';

/**
 * One shared Prisma client for the whole API.
 *
 * Prisma 7 talks to MySQL through the MariaDB driver adapter
 * (the same adapter works for MySQL 8). Services inject this class
 * instead of creating their own connection.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: AppConfigService) {
    super({ adapter: new PrismaMariaDb(config.databaseUrl) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
