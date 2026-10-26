import { Injectable } from '@nestjs/common';
import type { Locale, PublicSite } from '@portfolio/contracts';

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
}
