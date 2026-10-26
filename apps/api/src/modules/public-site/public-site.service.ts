import { Injectable } from '@nestjs/common';
import {
  type Locale,
  PAGE_PUBLIC_PATHS,
  PRISMA_PAGE_KEY_TO_PUBLIC,
  type PrismaPageKey,
  type PublicSite,
  type PublicSitemap,
} from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { NavigationService } from '../navigation/navigation.service';
import { ProfileService } from '../profile/profile.service';
import { ProfileStatsService } from '../profile-stats/profile-stats.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { SocialLinksService } from '../social-links/social-links.service';

@Injectable()
export class PublicSiteService {
  constructor(
    private readonly siteSettings: SiteSettingsService,
    private readonly profile: ProfileService,
    private readonly navigation: NavigationService,
    private readonly socialLinks: SocialLinksService,
    private readonly profileStats: ProfileStatsService,
    private readonly prisma: PrismaService,
  ) {}

  async getSite(locale: Locale): Promise<PublicSite> {
    const [settings, profile, nav, socialLinks, profileStats] = await Promise.all([
      this.siteSettings.getPublic(locale),
      this.profile.getPublic(locale),
      this.navigation.listPublic(locale),
      this.socialLinks.listPublic(locale),
      this.profileStats.listPublic(locale),
    ]);

    return { settings, profile, nav, socialLinks, profileStats };
  }

  async getSitemap(): Promise<PublicSitemap> {
    const [pages, projects, posts] = await Promise.all([
      this.prisma.page.findMany({
        where: { publishedVersionId: { not: null } },
        select: { key: true, publishedAt: true, updatedAt: true },
      }),
      this.prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const entries = [
      ...pages.map((page) => {
        const key = PRISMA_PAGE_KEY_TO_PUBLIC[page.key as PrismaPageKey];
        return {
          path: PAGE_PUBLIC_PATHS[key],
          updatedAt: (page.publishedAt ?? page.updatedAt).toISOString(),
        };
      }),
      ...projects.map((project) => ({
        path: `/projects/${project.slug}`,
        updatedAt: project.updatedAt.toISOString(),
      })),
      ...posts.map((post) => ({
        path: `/notes/${post.slug}`,
        updatedAt: post.updatedAt.toISOString(),
      })),
    ];

    return { entries };
  }
}
