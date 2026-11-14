import {
  invalidPreviewBlockSchema,
  pageSnapshotBlockSchema,
  pageSnapshotSchema,
  pageSnapshotSeoSchema,
  publicPageSeoSchema,
} from '@parker2808/cms-core/contracts';
import { z } from 'zod';

import { adminBlockSchema, blockKeySchema, publicBlockSchema } from '../blocks/block.schema';
import { blockTypeSchema } from '../blocks/block-registry.constant';
import { localeSchema } from '../common/locale.schema';
import { blockSurfaceSchema, layoutPresetSchema, pageKeySchema } from './pages.enum';

export {
  invalidPreviewBlockSchema,
  pageSnapshotBlockSchema,
  pageSnapshotSchema,
  pageSnapshotSeoSchema,
  publicPageSeoSchema,
};

export const publicPageSchema = z.object({
  key: pageKeySchema,
  seo: publicPageSeoSchema,
  blocks: z.array(publicBlockSchema),
});

export const publicPagePreviewSchema = publicPageSchema.extend({
  invalidBlocks: z.array(invalidPreviewBlockSchema),
});

export const adminPageListItemSchema = z.object({
  key: pageKeySchema,
  title: z.string().nullable().optional(),
  locale: localeSchema.optional(),
  blockCount: z.number().int(),
  updatedAt: z.string(),
  publishedVersion: z.number().int().nullable(),
  publishedAt: z.string().nullable(),
  hasUnpublishedChanges: z.boolean(),
});

export const adminPageSchema = z.object({
  key: pageKeySchema,
  title: z.string().nullable().optional(),
  locale: localeSchema.optional(),
  seoTitleEn: z.string().nullable(),
  seoTitleVi: z.string().nullable(),
  seoDescriptionEn: z.string().nullable(),
  seoDescriptionVi: z.string().nullable(),
  updatedAt: z.string(),
  publishedVersion: z.number().int().nullable(),
  publishedAt: z.string().nullable(),
  hasUnpublishedChanges: z.boolean(),
  blocks: z.array(adminBlockSchema),
});

export const publishPageSchema = z.object({
  note: z.string().max(200).optional(),
});

export const adminPageVersionListItemSchema = z.object({
  version: z.number().int(),
  createdAt: z.string(),
  authorName: z.string().nullable(),
  note: z.string().nullable(),
  blockCount: z.number().int(),
});

export const adminPageVersionSchema = adminPageVersionListItemSchema.extend({
  snapshot: pageSnapshotSchema,
});

export const updatePageSchema = z.object({
  seoTitleEn: z.string().nullable().optional(),
  seoTitleVi: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionVi: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
});

export const createPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  key: pageKeySchema,
  locale: localeSchema,
  template: z.enum(['starter', 'empty']),
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
