import { Injectable } from '@nestjs/common';
import type { Locale, PublicNavItem } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { navItemSelect } from './entities/nav-item.entity';
import { toPublicNavItem } from './entities/nav-item.mapper';

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
}
