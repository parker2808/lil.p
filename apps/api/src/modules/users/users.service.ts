import { ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import type {
  AdminUser,
  AdminUserListPage,
  AdminUserListParams,
  CreateUserInput,
  Paginated,
  Role,
  UpdateUserInput,
} from '@portfolio/contracts';
import { parseSort } from '@portfolio/contracts';
import * as argon2 from 'argon2';

import { paginate } from '../../common/utils/paginate.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService, withAuditTx } from '../audit/audit.service';
import { type UserRow, userSelect } from './entities/user.entity';
import { toAdminUser } from './entities/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  findByEmail(email: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({ where: { email }, select: userSelect });
  }

  findById(id: number): Promise<UserRow | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async create(input: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }): Promise<UserRow> {
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    return withAuditTx(this.prisma, this.audit, async (db) => {
      const created = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role ?? 'user',
        },
        select: userSelect,
      });
      await this.audit?.record(db, {
        action: 'CREATE',
        entityType: 'user',
        entityId: created.id,
        summary: `Created user ${created.name}`,
      });
      return created;
    });
  }

  async createAdmin(input: CreateUserInput): Promise<AdminUser> {
    return toAdminUser(await this.create(input));
  }

  async list(params: AdminUserListParams): Promise<AdminUserListPage> {
    const { field, direction } = parseSort(params.sort);
    const where: Prisma.UserWhereInput = params.q
      ? {
          OR: [{ name: { contains: params.q } }, { email: { contains: params.q } }],
        }
      : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { [field]: direction },
        ...paginate(params.page, params.pageSize),
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: rows.map(toAdminUser),
      page: params.page,
      pageSize: params.pageSize,
      total,
    } satisfies Paginated<AdminUser>;
  }

  async update(actorId: number, id: number, input: UpdateUserInput): Promise<AdminUser> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id }, select: userSelect });
      if (!current) {
        throw new NotFoundException({ code: 'NOT_FOUND', message: `User ${id} was not found` });
      }

      const nextRole = input.role ?? current.role;
      const nextActive = input.isActive ?? current.isActive;
      const roleChanged = input.role !== undefined && input.role !== current.role;
      const activeChanged = input.isActive !== undefined && input.isActive !== current.isActive;

      if ((roleChanged || activeChanged) && id === actorId) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: 'You cannot change your own role or active state',
        });
      }

      if (current.role === 'admin' && current.isActive && (nextRole !== 'admin' || !nextActive)) {
        const otherAdmins = await tx.user.count({
          where: { role: 'admin', isActive: true, id: { not: id } },
        });
        if (otherAdmins === 0) {
          throw new ConflictException({
            code: 'LAST_ADMIN',
            message: 'The last active admin cannot be demoted or deactivated',
          });
        }
      }

      const updated = await tx.user.update({
        where: { id },
        data: {
          name: input.name,
          role: input.role,
          isActive: input.isActive,
          ...(roleChanged || activeChanged ? { tokenVersion: { increment: 1 } } : {}),
        },
        select: userSelect,
      });
      await this.audit?.record(tx, {
        userId: actorId,
        action: 'UPDATE',
        entityType: 'user',
        entityId: id,
        summary: `Updated user ${updated.name}`,
      });
      return toAdminUser(updated);
    });
  }

  async setPassword(id: number, password: string): Promise<AdminUser> {
    const current = await this.findById(id);
    if (!current) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `User ${id} was not found` });
    }
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    return toAdminUser(
      await withAuditTx(this.prisma, this.audit, async (db) => {
        const updated = await db.user.update({
          where: { id },
          data: { passwordHash, tokenVersion: { increment: 1 } },
          select: userSelect,
        });
        await this.audit?.record(db, {
          action: 'UPDATE',
          entityType: 'user',
          entityId: id,
          summary: `Set password for ${updated.name}`,
        });
        return updated;
      }),
    );
  }

  async bumpTokenVersion(id: number): Promise<UserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
      select: userSelect,
    });
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<UserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
      select: userSelect,
    });
  }

  touchLastLogin(id: number): Promise<UserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: userSelect,
    });
  }
}
