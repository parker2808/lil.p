import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import type {
  AdminDomain,
  DomainCreateInput,
  DomainUpdateInput,
  Locale,
  PublicDomain,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PublishingService } from '../publishing/publishing.service';
import { DOMAIN_TAGS } from '../publishing/tags.util';
import { domainSelect } from './entities/domain.entity';
import { toAdminDto, toPublicDomain } from './entities/domain.mapper';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listPublic(locale: Locale): Promise<PublicDomain[]> {
    const rows = await this.prisma.domain.findMany({
      where: { isVisible: true },
      select: domainSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicDomain(row, locale));
  }

  async listAdmin(): Promise<AdminDomain[]> {
    const rows = await this.prisma.domain.findMany({
      select: domainSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminDomain[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).domain, ids);
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'domain',
      entityId: ids[0] ?? 0,
      summary: `Reordered ${ids.length} domains`,
    });
    this.bump();
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminDomain> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: DomainCreateInput): Promise<AdminDomain> {
    const row = await this.prisma.domain.create({
      data: {
        slug: input.slug,
        nameEn: input.nameEn,
        nameVi: input.nameVi,
        descriptionEn: input.descriptionEn,
        descriptionVi: input.descriptionVi,
        hue: input.hue,
        iconKey: input.iconKey,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: domainSelect,
    });
    await this.audit?.recordNow({
      action: 'CREATE',
      entityType: 'domain',
      entityId: row.id,
      summary: `Created domain ${row.slug}`,
    });
    this.bump();
    return toAdminDto(row);
  }

  async update(id: number, input: DomainUpdateInput): Promise<AdminDomain> {
    await this.findRow(id);
    const data: Prisma.DomainUncheckedUpdateInput = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.nameEn !== undefined) data.nameEn = input.nameEn;
    if (input.nameVi !== undefined) data.nameVi = input.nameVi;
    if (input.descriptionEn !== undefined) data.descriptionEn = input.descriptionEn;
    if (input.descriptionVi !== undefined) data.descriptionVi = input.descriptionVi;
    if (input.hue !== undefined) data.hue = input.hue;
    if (input.iconKey !== undefined) data.iconKey = input.iconKey;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    const row = await this.prisma.domain.update({ where: { id }, data, select: domainSelect });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'domain',
      entityId: id,
      summary: `Updated domain ${row.slug}`,
    });
    this.bump();
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminDomain> {
    const current = await this.findRow(id);
    await this.prisma.domain.delete({ where: { id } });
    await this.audit?.recordNow({
      action: 'ARCHIVE',
      entityType: 'domain',
      entityId: id,
      summary: `Deleted domain ${current.slug}`,
    });
    this.bump();
    return toAdminDto(current);
  }

  private bump(): void {
    void this.publishing?.revalidate([...DOMAIN_TAGS]);
  }

  private async findRow(id: number) {
    const row = await this.prisma.domain.findUnique({ where: { id }, select: domainSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Domain ${id} was not found` });
    }
    return row;
  }
}
