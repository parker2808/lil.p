import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { iconKeySchema } from '../constants/icons.constant';
import { hueSchema } from './domains.enum';

export const publicDomainSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  hue: hueSchema,
  iconKey: iconKeySchema,
  projectCount: z.number().int(),
  lang: localeSchema,
});

export const publicProjectDomainSchema = z.object({
  slug: z.string(),
  name: z.string(),
  hue: hueSchema,
  iconKey: iconKeySchema,
  lang: localeSchema,
});
