import { z } from 'zod';

export const TREE_VERSION = 1;
export const TREE_LIMITS = {
  depth: 5,
  nodes: 500,
  bytes: 256 * 1024,
  propsBytes: 128 * 1024,
} as const;

export const treeIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/);
export const jsonRecordSchema = z.record(z.string(), z.json());
export const responsiveSchema = z.strictObject({
  base: jsonRecordSchema,
  mobile: jsonRecordSchema.optional(),
  tablet: jsonRecordSchema.optional(),
  desktop: jsonRecordSchema.optional(),
});

export type ResponsiveProps = z.infer<typeof responsiveSchema>;
type NodeBase = { id: string; responsive: ResponsiveProps };
type Without<Fields extends string> = { [Field in Fields]?: never };
export type ComponentNode = NodeBase & { type: 'component'; componentType: string } & Without<
    'sections' | 'content' | 'columns' | 'items'
  >;
export type LegacyComponentNode = NodeBase & { type: 'legacy-component' } & Without<
    'sections' | 'content' | 'columns' | 'items' | 'componentType'
  >;
export type ContentNode = ComponentNode | LegacyComponentNode;
export type GridNode = NodeBase & { type: 'grid'; items: ContentNode[] } & Without<
    'sections' | 'content' | 'columns' | 'componentType'
  >;
export type ColumnNode = NodeBase & { type: 'column'; content: ContentNode[] } & Without<
    'sections' | 'columns' | 'items' | 'componentType'
  >;
export type RowNode = NodeBase & { type: 'row'; columns: ColumnNode[] } & Without<
    'sections' | 'content' | 'items' | 'componentType'
  >;
export type SectionNode = NodeBase & {
  type: 'section';
  content: (ContentNode | RowNode | GridNode)[];
} & Without<'sections' | 'columns' | 'items' | 'componentType'>;
export type PageNode = NodeBase & { type: 'page'; sections: SectionNode[] } & Without<
    'content' | 'columns' | 'items' | 'componentType'
  >;
export type TreeNode = PageNode | SectionNode | RowNode | GridNode | ColumnNode | ContentNode;
export type TreeDocument = { schemaVersion: 1; root: PageNode };

function nodeSchemaFor(version: 0 | 1): z.ZodType {
  const attributes = version === 1 ? { responsive: responsiveSchema } : { props: jsonRecordSchema };
  const node: z.ZodType = z.lazy(() =>
    z.discriminatedUnion('type', [
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('page'),
        ...attributes,
        sections: z.array(node),
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('section'),
        ...attributes,
        content: z.array(node),
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('row'),
        ...attributes,
        columns: z.array(node),
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('grid'),
        ...attributes,
        items: z.array(node),
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('column'),
        ...attributes,
        content: z.array(node),
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('component'),
        componentType: z.string().min(1).max(96),
        ...attributes,
      }),
      z.strictObject({
        id: treeIdSchema,
        type: z.literal('legacy-component'),
        ...attributes,
      }),
    ]),
  );
  return node;
}

export const treeDocumentSchema = z.strictObject({
  schemaVersion: z.literal(TREE_VERSION),
  root: nodeSchemaFor(1),
});
export const legacyTreeDocumentSchema = z.strictObject({
  schemaVersion: z.literal(0),
  root: nodeSchemaFor(0),
});

export const starterComponentSchemas = {
  heading: z.strictObject({
    text: z.string().min(1).max(500),
    level: z.number().int().min(1).max(6),
  }),
  paragraph: z.strictObject({ text: z.string().max(10000) }),
  'rich-text': z.strictObject({
    text: z
      .string()
      .max(10000)
      .regex(/^[^<>]*$/),
  }),
  image: z.strictObject({ src: z.string().max(2048), alt: z.string().min(1).max(500) }),
  button: z.strictObject({ label: z.string().min(1).max(200), href: z.string().max(2048) }),
  divider: z.strictObject({}),
  spacer: z.strictObject({ size: z.enum(['sm', 'md', 'lg']) }),
} as const;
