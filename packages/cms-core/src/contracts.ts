import { z } from 'zod';

export const localeSchema = z.enum(['en', 'vi']);
export type Locale = z.infer<typeof localeSchema>;
export const localeQuerySchema = z.object({ locale: localeSchema.default('en') });
export const pageKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export type PageKey = z.infer<typeof pageKeySchema>;
export const layoutPresetSchema = z.enum([
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'SPLIT_8_4',
  'SPLIT_4_8',
  'SPLIT_7_5',
]);
export type LayoutPreset = z.infer<typeof layoutPresetSchema>;
export const blockSurfaceSchema = z.enum(['PLAIN', 'BAND']);
export type BlockSurface = z.infer<typeof blockSurfaceSchema>;
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
  updatedAt: z.string(),
  issues: z.array(z.string()).optional(),
});
export type AdminBlock = z.infer<typeof adminBlockSchema>;
export const publicBlockSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  key: blockKeySchema,
  layout: layoutPresetSchema,
  surface: blockSurfaceSchema,
  props: z.record(z.string(), z.unknown()),
  lang: localeSchema,
});
export type PublicBlock = z.infer<typeof publicBlockSchema>;

export const pageSnapshotBlockSchema = z.object({
  type: z.string(),
  key: blockKeySchema,
  schemaVersion: z.number().int(),
  props: z.unknown(),
  layout: layoutPresetSchema,
  surface: blockSurfaceSchema,
  isVisible: z.boolean(),
  sortOrder: z.number().int(),
});
export type PageSnapshotBlock = z.infer<typeof pageSnapshotBlockSchema>;
export const pageSnapshotSeoSchema = z.object({
  seoTitleEn: z.string().nullable(),
  seoTitleVi: z.string().nullable(),
  seoDescriptionEn: z.string().nullable(),
  seoDescriptionVi: z.string().nullable(),
});
export const pageSnapshotSchema = z.object({
  seo: pageSnapshotSeoSchema,
  blocks: z.array(pageSnapshotBlockSchema),
});
export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

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
export type PublicPage = z.infer<typeof publicPageSchema>;
export const invalidPreviewBlockSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  key: z.string(),
  issues: z.array(z.string()),
});
export type InvalidPreviewBlock = z.infer<typeof invalidPreviewBlockSchema>;
export const publicPagePreviewSchema = publicPageSchema.extend({
  invalidBlocks: z.array(invalidPreviewBlockSchema),
});
export type PublicPagePreview = z.infer<typeof publicPagePreviewSchema>;

export type BlockRole = 'h1' | 'required' | 'optional';
export type BlockRef = { kind: string; id: number };
export type BlockDefinition<T extends z.ZodType = z.ZodType> = {
  type: string;
  version: number;
  props: T;
  defaults: z.infer<T>;
  pages: readonly PageKey[];
  customPage?: boolean;
  layouts: readonly LayoutPreset[];
  maxPerPage?: number;
  role: BlockRole;
  migrate: (props: unknown, fromVersion: number) => unknown;
  refs: (props: z.infer<T>) => BlockRef[];
};

export function defineBlock<T extends z.ZodType, const Type extends string>(
  definition: Omit<BlockDefinition<T>, 'type' | 'migrate' | 'refs'> & {
    type: Type;
    migrate?: (props: unknown, fromVersion: number) => unknown;
    refs?: (props: z.infer<T>) => BlockRef[];
  },
): BlockDefinition<T> & { type: Type } {
  return {
    ...definition,
    migrate: definition.migrate ?? ((props) => props),
    refs: definition.refs ?? (() => []),
  };
}

export function createRegistry<const Definitions extends readonly BlockDefinition[]>(
  definitions: Definitions,
): { [Definition in Definitions[number] as Definition['type']]: Definition } {
  const registry: Record<string, BlockDefinition> = Object.create(null);
  for (const definition of definitions) {
    if (Object.hasOwn(registry, definition.type)) {
      throw new Error(`Duplicate block type: ${definition.type}`);
    }
    registry[definition.type] = definition;
  }
  return registry as { [Definition in Definitions[number] as Definition['type']]: Definition };
}

export function isBlockAllowedOnPage(
  definition: Pick<BlockDefinition, 'pages' | 'customPage'>,
  pageKey: PageKey,
  builtInPageKeys: readonly PageKey[],
): boolean {
  return builtInPageKeys.includes(pageKey)
    ? definition.pages.includes(pageKey)
    : definition.customPage === true;
}
