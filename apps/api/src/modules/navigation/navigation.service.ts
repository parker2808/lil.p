import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminNavItem,
  Locale,
  NavItemCreateInput,
  NavItemUpdateInput,
  PublicNavItem,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { navItemSelect } from './entities/nav-item.entity';
import { toAdminDto, toPublicNavItem } from './entities/nav-item.mapper';

@Injectable()
export class NavigationService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<{ header: PublicNavItem[]; footer: PublicNavItem[] }> {
    const rows = await this.prisma.navItem.findMany({
      where: { isVisible: true },
      select: navItemSelect,
      orderBy: { sortOrder: 'asc' },
    });

    const mapped = rows.map((row) => toPublicNavItem(row, locale));
    return {
      header: mapped.filter((item) => item.location === 'HEADER'),
      footer: mapped.filter((item) => item.location === 'FOOTER'),
    };
  }

  async listAdmin(): Promise<AdminNavItem[]> {
    const rows = await this.prisma.navItem.findMany({
      select: navItemSelect,
      orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }],
    });
    return rows.map(toAdminDto);
  }

  async getAdmin(id: number): Promise<AdminNavItem> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: NavItemCreateInput): Promise<AdminNavItem> {
    const row = await this.prisma.navItem.create({
      data: {
        location: input.location,
        labelEn: input.labelEn,
        labelVi: input.labelVi,
        href: input.href,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: navItemSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: NavItemUpdateInput): Promise<AdminNavItem> {
    await this.findRow(id);
    const data: Prisma.NavItemUncheckedUpdateInput = {};
    if (input.location !== undefined) data.location = input.location;
    if (input.labelEn !== undefined) data.labelEn = input.labelEn;
    if (input.labelVi !== undefined) data.labelVi = input.labelVi;
    if (input.href !== undefined) data.href = input.href;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    const row = await this.prisma.navItem.update({ where: { id }, data, select: navItemSelect });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminNavItem> {
    const current = await this.findRow(id);
    await this.prisma.navItem.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.navItem.findUnique({ where: { id }, select: navItemSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Nav item ${id} was not found` });
    }
    return row;
  }
}
