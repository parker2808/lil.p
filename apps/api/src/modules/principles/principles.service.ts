import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import type {
  AdminPrinciple,
  Locale,
  PrincipleCreateInput,
  PrincipleUpdateInput,
  PublicPrinciple,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { principleSelect } from './entities/principle.entity';
import { toAdminDto, toPublicPrinciple } from './entities/principle.mapper';

@Injectable()
export class PrinciplesService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listPublic(locale: Locale): Promise<PublicPrinciple[]> {
    const rows = await this.prisma.principle.findMany({
      where: { isVisible: true },
      select: principleSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicPrinciple(row, locale));
  }

  async listAdmin(): Promise<AdminPrinciple[]> {
    const rows = await this.prisma.principle.findMany({
      select: principleSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminPrinciple[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).principle, ids);
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'principle',
      entityId: ids[0] ?? 0,
      summary: `Reordered ${ids.length} principles`,
    });
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminPrinciple> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: PrincipleCreateInput): Promise<AdminPrinciple> {
    const row = await this.prisma.principle.create({
      data: this.toWriteData(input) as Prisma.PrincipleUncheckedCreateInput,
      select: principleSelect,
    });
    await this.audit?.recordNow({
      action: 'CREATE',
      entityType: 'principle',
      entityId: row.id,
      summary: `Created principle ${row.titleEn}`,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: PrincipleUpdateInput): Promise<AdminPrinciple> {
    await this.findRow(id);
    const row = await this.prisma.principle.update({
      where: { id },
      data: this.toWriteData(input),
      select: principleSelect,
    });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'principle',
      entityId: id,
      summary: `Updated principle ${row.titleEn}`,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminPrinciple> {
    const current = await this.findRow(id);
    await this.prisma.principle.delete({ where: { id } });
    await this.audit?.recordNow({
      action: 'ARCHIVE',
      entityType: 'principle',
      entityId: id,
      summary: `Deleted principle ${current.titleEn}`,
    });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.principle.findUnique({
      where: { id },
      select: principleSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Principle ${id} was not found`,
      });
    }
    return row;
  }

  private toWriteData(input: Partial<PrincipleCreateInput>): Prisma.PrincipleUncheckedUpdateInput {
    const data: Prisma.PrincipleUncheckedUpdateInput = {};
    if (input.titleEn !== undefined) data.titleEn = input.titleEn;
    if (input.titleVi !== undefined) data.titleVi = input.titleVi;
    if (input.bodyEn !== undefined) data.bodyEn = input.bodyEn;
    if (input.bodyVi !== undefined) data.bodyVi = input.bodyVi;
    if (input.iconKey !== undefined) data.iconKey = input.iconKey;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    return data;
  }
}
