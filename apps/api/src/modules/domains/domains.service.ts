import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminDomain,
  DomainCreateInput,
  DomainUpdateInput,
  Locale,
  PublicDomain,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { domainSelect } from './entities/domain.entity';
import { toAdminDto, toPublicDomain } from './entities/domain.mapper';

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

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
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminDomain> {
    const current = await this.findRow(id);
    await this.prisma.domain.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.domain.findUnique({ where: { id }, select: domainSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Domain ${id} was not found` });
    }
    return row;
  }
}
