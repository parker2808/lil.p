import { z } from 'zod';

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_VARIANT_WIDTHS = [480, 960, 1600] as const;

export const publicImageSchema = z.object({
  url: z.string(),
  srcset: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  alt: z.string(),
});

export const adminMediaSchema = z.object({
  id: z.number().int(),
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  altEn: z.string(),
  altVi: z.string(),
  resourceType: z.string(),
  uploadedById: z.number().int().nullable(),
  url: z.string(),
  srcset: z.string(),
  createdAt: z.string(),
});

export const adminMediaListParamsSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminMediaListPageSchema = z.object({
  items: z.array(adminMediaSchema),
  nextCursor: z.number().int().nullable(),
});

export const updateMediaSchema = z.object({
  altEn: z.string().max(200).optional(),
  altVi: z.string().max(200).optional(),
});

export const adminProjectImageInputSchema = z.object({
  mediaId: z.number().int(),
  captionEn: z.string().nullable().optional(),
  captionVi: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const adminProjectImageSchema = z.object({
  id: z.number().int(),
  mediaId: z.number().int(),
  captionEn: z.string().nullable(),
  captionVi: z.string().nullable(),
  sortOrder: z.number().int(),
  media: adminMediaSchema,
});

export const publicFileSchema = z.object({
  url: z.string(),
});
