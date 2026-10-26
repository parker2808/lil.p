import { z } from 'zod';

export const localeSchema = z.enum(['en', 'vi']);

export type Locale = z.infer<typeof localeSchema>;

export const localeQuerySchema = z.object({
  locale: localeSchema.default('en'),
});
