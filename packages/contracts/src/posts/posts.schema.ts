import { z } from 'zod';

import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';
import { localeSchema } from '../common/locale.schema';
import { publicImageSchema } from '../media/media.schema';
import { contentStatusSchema } from '../projects/projects.enum';
import { publicTagSchema } from '../tags/tags.schema';

const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a kebab-case slug');

const takeawaysSchema = z
  .string()
  .refine((value) => value.split('\n').filter((line) => line.trim()).length <= 5, {
    message: 'Takeaways must be at most 5 lines',
  });

export const adminPostInputSchema = z.object({
  slug: slugSchema,
  titleEn: z.string().min(1),
  titleVi: z.string(),
  excerptEn: z.string().min(1),
  excerptVi: z.string(),
  bodyEn: z.string().min(1),
  bodyVi: z.string(),
  takeawaysEn: takeawaysSchema,
  takeawaysVi: z.string(),
  seoTitleEn: z.string().nullable().optional(),
  seoTitleVi: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionVi: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  coverId: z.number().int().nullable().optional(),
  tagIds: z.array(z.number().int()).optional(),
});

export const postCreateSchema = adminPostInputSchema;

export const postUpdateSchema = adminPostInputSchema.partial().extend({
  updatedAt: z.string().optional(),
});

export const adminPostListParamsSchema = listParamsSchema([
  '-updatedAt',
  'updatedAt',
  '-id',
  'id',
  'sortOrder',
  '-sortOrder',
  '-publishedAt',
  'publishedAt',
]).extend({
  status: contentStatusSchema.optional(),
  tag: z.string().min(1).optional(),
});

export const adminPostSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  titleEn: z.string(),
  titleVi: z.string(),
  excerptEn: z.string(),
  excerptVi: z.string(),
  bodyEn: z.string(),
  bodyVi: z.string(),
  takeawaysEn: z.string(),
  takeawaysVi: z.string(),
  seoTitleEn: z.string().nullable(),
  seoTitleVi: z.string().nullable(),
  seoDescriptionEn: z.string().nullable(),
  seoDescriptionVi: z.string().nullable(),
  readingMinutes: z.number().int(),
  isFeatured: z.boolean(),
  status: contentStatusSchema,
  publishedAt: z.string().nullable(),
  sortOrder: z.number().int(),
  coverId: z.number().int().nullable(),
  tagIds: z.array(z.number().int()),
  updatedAt: z.string(),
});

export const adminPostListTagSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  nameEn: z.string(),
});

export const adminPostListItemSchema = adminPostSchema
  .pick({
    id: true,
    slug: true,
    titleEn: true,
    titleVi: true,
    status: true,
    isFeatured: true,
    readingMinutes: true,
    publishedAt: true,
    updatedAt: true,
  })
  .extend({
    tags: z.array(adminPostListTagSchema),
  });

export const adminPostListPageSchema = paginatedSchema(adminPostListItemSchema);

export const publicPostTagSchema = publicTagSchema.omit({ postCount: true });

export const postListParamsSchema = listParamsSchema([
  '-publishedAt',
  'publishedAt',
  '-id',
  'id',
]).extend({
  tag: z.string().min(1).optional(),
});

export const publicPostListItemSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  readingMinutes: z.number().int(),
  isFeatured: z.boolean(),
  publishedAt: z.string().nullable(),
  tags: z.array(publicPostTagSchema),
  cover: publicImageSchema.nullable().optional(),
  lang: localeSchema,
});

export const publicPostListPageSchema = paginatedSchema(publicPostListItemSchema);

export const publicPostDetailSchema = publicPostListItemSchema.extend({
  body: z.string(),
  takeaways: z.array(z.string()).max(5),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});
