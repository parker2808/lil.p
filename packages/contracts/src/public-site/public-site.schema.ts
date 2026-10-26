import { z } from 'zod';

import { publicNavItemSchema } from '../navigation/navigation.schema';
import { publicProfileSchema } from '../profile/profile.schema';
import { publicProfileStatSchema } from '../profile-stats/profile-stats.schema';
import { publicSiteSettingsSchema } from '../site-settings/site-settings.schema';
import { publicSocialLinkSchema } from '../social-links/social-links.schema';

export const publicSiteSchema = z.object({
  settings: publicSiteSettingsSchema,
  profile: publicProfileSchema,
  nav: z.object({
    header: z.array(publicNavItemSchema),
    footer: z.array(publicNavItemSchema),
  }),
  socialLinks: z.array(publicSocialLinkSchema),
  profileStats: z.array(publicProfileStatSchema),
});

export const publicSitemapEntrySchema = z.object({
  path: z.string(),
  updatedAt: z.string(),
});

export const publicSitemapSchema = z.object({
  entries: z.array(publicSitemapEntrySchema),
});
