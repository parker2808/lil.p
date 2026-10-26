import { z } from 'zod';

import { localeSchema } from '../common/locale.schema';
import { blockSurfaceSchema, layoutPresetSchema } from '../pages/pages.enum';
import { blockTypeSchema } from './block-registry.constant';

export const blockKeySchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case')
  .max(48);

export const adminBlockSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  key: blockKeySchema,
  layout: layoutPresetSchema,
  surface: blockSurfaceSchema,
  schemaVersion: z.number().int(),
  props: z.unknown(),
  isVisible: z.boolean(),
  sortOrder: z.number().int(),
  issues: z.array(z.string()).optional(),
});

export const publicBlockSchema = z.object({
  id: z.number().int(),
  type: blockTypeSchema,
  key: blockKeySchema,
  layout: layoutPresetSchema,
  surface: blockSurfaceSchema,
  props: z.record(z.string(), z.unknown()),
  lang: localeSchema,
});
