import { z } from 'zod';

import { adminBlockSchema, blockKeySchema, publicBlockSchema } from '../blocks/block.schema';
import { blockTypeSchema } from '../blocks/block-registry.constant';
import { localeSchema } from '../common/locale.schema';
import { blockSurfaceSchema, layoutPresetSchema, pageKeySchema } from './pages.enum';

export const publicPageSeoSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  lang: localeSchema,
});

export const publicPageSchema = z.object({
  key: pageKeySchema,
  seo: publicPageSeoSchema,
  blocks: z.array(publicBlockSchema),
});

export const adminPageListItemSchema = z.object({
  key: pageKeySchema,
  blockCount: z.number().int(),
  updatedAt: z.string(),
});

export const adminPageSchema = z.object({
  key: pageKeySchema,
  seoTitleEn: z.string().nullable(),
  seoTitleVi: z.string().nullable(),
  seoDescriptionEn: z.string().nullable(),
  seoDescriptionVi: z.string().nullable(),
  updatedAt: z.string(),
  blocks: z.array(adminBlockSchema),
});

export const updatePageSchema = z.object({
  seoTitleEn: z.string().nullable().optional(),
  seoTitleVi: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionVi: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
});

export const createBlockSchema = z.object({
  type: blockTypeSchema,
  afterId: z.number().int().positive().optional(),
});

export const updateBlockSchema = z.object({
  props: z.unknown().optional(),
  layout: layoutPresetSchema.optional(),
  surface: blockSurfaceSchema.optional(),
  isVisible: z.boolean().optional(),
  key: blockKeySchema.optional(),
  updatedAt: z.string().optional(),
});
