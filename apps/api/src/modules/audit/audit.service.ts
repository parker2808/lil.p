import { Injectable } from '@nestjs/common';
import type {
  AdminAuditListPage,
  AdminAuditListParams,
  AdminAuditLog,
  AuditAction,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { currentAuditUserId } from './audit-actor.store';

export type AuditClient = PrismaService | Prisma.TransactionClient;

export type AuditRecordInput = {
  userId?: number | null;
  action: AuditAction;
  entityType: string;
  entityId: string | number;
  summary: string;
};

export async function withAuditTx<T>(
  prisma: PrismaService,
  audit: AuditService | undefined,
  work: (db: AuditClient) => Promise<T>,
): Promise<T> {
  if (!audit) {
    return work(prisma);
  }
  return prisma.$transaction((tx) => work(tx));
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(db: AuditClient, input: AuditRecordInput): Promise<void> {
    const summary = input.summary.slice(0, 500);
    await db.auditLog.create({
      data: {
        userId: input.userId === undefined ? currentAuditUserId() : input.userId,
        action: input.action,
        entityType: input.entityType.slice(0, 64),
        entityId: String(input.entityId).slice(0, 64),
        summary,
      },
    });
  }

  recordNow(input: AuditRecordInput): Promise<void> {
    return this.record(this.prisma, input);
  }

  async list(params: AdminAuditListParams): Promise<AdminAuditListPage> {
    const where: Prisma.AuditLogWhereInput = {
      ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
    };
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: { id: 'desc' },
      take: params.limit + 1,
      include: { user: { select: { name: true } } },
    });
    const page = rows.slice(0, params.limit);
    const extra = rows[params.limit];
    return {
      items: page.map(toAdminAuditLog),
      nextCursor: extra ? (page[page.length - 1]?.id ?? null) : null,
    };
  }
}

function toAdminAuditLog(row: {
  id: number;
  userId: number | null;
  user: { name: string } | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: Date;
}): AdminAuditLog {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.user?.name ?? null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.summary,
    createdAt: row.createdAt.toISOString(),
  };
}
