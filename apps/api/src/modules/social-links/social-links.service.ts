import { Injectable } from '@nestjs/common';
import type { Locale, PublicSocialLink } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { socialLinkSelect } from './entities/social-link.entity';
import { toPublicSocialLink } from './entities/social-link.mapper';

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicSocialLink[]> {
    const rows = await this.prisma.socialLink.findMany({
      where: { isVisible: true },
      select: socialLinkSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicSocialLink(row, locale));
  }
}
