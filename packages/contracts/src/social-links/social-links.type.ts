import type { z } from 'zod';

import type { publicSocialLinkSchema } from './social-links.schema';

export type PublicSocialLink = z.infer<typeof publicSocialLinkSchema>;
