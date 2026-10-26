import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { PUBLIC_ROUTES } from '../constants/routes.constant';
import { navLocationSchema } from './navigation.enum';

export const navHrefSchema = z
  .string()
  .min(1)
  .refine(
    (href) => (PUBLIC_ROUTES as readonly string[]).includes(href) || /^https:\/\//.test(href),
    { message: 'Must be a public route or an https URL' },
  );

export const publicNavItemSchema = z.object({
  id: z.number().int(),
  location: navLocationSchema,
  label: z.string(),
  href: z.string(),
  lang: localeSchema,
});

export const navItemCreateSchema = z.object({
  location: navLocationSchema,
  labelEn: z.string().min(1),
  labelVi: z.string(),
  href: navHrefSchema,
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const navItemUpdateSchema = navItemCreateSchema.partial();

export const adminNavItemSchema = z.object({
  id: z.number().int(),
  location: navLocationSchema,
  labelEn: z.string(),
  labelVi: z.string(),
  href: z.string(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  updatedAt: z.string(),
});
