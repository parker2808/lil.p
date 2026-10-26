import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { socialKindSchema } from './social-links.enum';

export const publicSocialLinkSchema = z.object({
  id: z.number().int(),
  kind: socialKindSchema,
  label: z.string(),
  url: z.string(),
  showInHeader: z.boolean(),
  showInCta: z.boolean(),
  lang: localeSchema,
});
