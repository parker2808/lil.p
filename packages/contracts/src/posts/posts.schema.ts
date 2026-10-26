import { z } from 'zod';

import { listParamsSchema, paginatedSchema } from '../common/list-params.schema';
import { localeSchema } from '../common/locale.schema';
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
});

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
  lang: localeSchema,
});

export const publicPostListPageSchema = paginatedSchema(publicPostListItemSchema);

export const publicPostDetailSchema = publicPostListItemSchema.extend({
  body: z.string(),
  takeaways: z.array(z.string()).max(5),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});
