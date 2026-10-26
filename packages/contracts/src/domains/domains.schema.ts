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

export const domainCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameEn: z.string().min(1),
  nameVi: z.string(),
  descriptionEn: z.string(),
  descriptionVi: z.string(),
  hue: hueSchema,
  iconKey: iconKeySchema,
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const domainUpdateSchema = domainCreateSchema.partial();

export const adminDomainSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  nameEn: z.string(),
  nameVi: z.string(),
  descriptionEn: z.string(),
  descriptionVi: z.string(),
  hue: hueSchema,
  iconKey: iconKeySchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
