import type { z } from 'zod';

import type {
  adminSocialLinkSchema,
  publicSocialLinkSchema,
  socialLinkCreateSchema,
  socialLinkUpdateSchema,
} from './social-links.schema';

export type PublicSocialLink = z.infer<typeof publicSocialLinkSchema>;
export type SocialLinkCreateInput = z.infer<typeof socialLinkCreateSchema>;
export type SocialLinkUpdateInput = z.infer<typeof socialLinkUpdateSchema>;
export type AdminSocialLink = z.infer<typeof adminSocialLinkSchema>;
