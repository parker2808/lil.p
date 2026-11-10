import { z } from 'zod';

import {
  jsonRecordSchema,
  type ResponsiveProps,
  starterComponentSchemas,
  TREE_LIMITS,
  TREE_VERSION,
  type TreeDocument,
  treeDocumentSchema,
  type TreeNode,
} from './schema';

export type TreeErrorCode =
  | 'INVALID_TREE'
  | 'UNSUPPORTED_VERSION'
  | 'UNKNOWN_TYPE'
  | 'INVALID_SLOT'
  | 'DUPLICATE_ID'
  | 'TREE_LIMIT'
  | 'INVALID_PROPS'
  | 'HEADING_RULE';
export type TreeResult<Value> =
  { ok: true; value: Value } | { ok: false; code: TreeErrorCode; input: unknown; nodeId?: string };
export type ComponentRegistration = { props: z.ZodType; role?: 'h1' | 'required' | 'optional' };
export type ComponentRegistry = Readonly<Record<string, ComponentRegistration>>;

const layoutSchemas: Record<string, z.ZodType> = {
  page: z.strictObject({}),
  section: z.strictObject({}),
  row: z.strictObject({}),
  grid: z.strictObject({ columns: z.number().int().min(2).max(4) }),
  column: z.strictObject({ span: z.number().int().min(1).max(4) }),
};

export function resolveResponsive(
  props: ResponsiveProps,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
): ResponsiveProps['base'] {
  return { ...props.base, ...props[breakpoint] };
}

export function serializedBytes(value: unknown): number | undefined {
  try {
    const json = JSON.stringify(value);
    if (json === undefined) return undefined;
    return encodeURIComponent(json).replace(/%[0-9A-F]{2}/g, 'x').length;
  } catch {
    return undefined;
  }
}

function safeUrl(value: string): boolean {
  return (
    (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) ||
    /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::[0-9]{1,5})?(?:[/?#][^\s\\]*)?$/i.test(value)
  );
}

function exactParse(schema: z.ZodType, value: unknown): boolean {
  const parsed = schema.safeParse(value);
  return parsed.success && canonical(parsed.data) === canonical(value);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function readTree(
  input: unknown,
  registry: ComponentRegistry = {},
): TreeResult<TreeDocument> {
  const bytes = serializedBytes(input);
  if (bytes === undefined || bytes > TREE_LIMITS.bytes)
    return { ok: false, code: 'TREE_LIMIT', input };
  if (!input || typeof input !== 'object' || !('schemaVersion' in input)) {
    return { ok: false, code: 'INVALID_TREE', input };
  }
  if (input.schemaVersion !== TREE_VERSION) {
    return { ok: false, code: 'UNSUPPORTED_VERSION', input };
  }
  const parsed = treeDocumentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'INVALID_TREE', input };
  if (canonical(parsed.data) !== canonical(input))
    return { ok: false, code: 'INVALID_TREE', input };
  const document = parsed.data as TreeDocument;
  if (document.root.type !== 'page') return { ok: false, code: 'INVALID_SLOT', input };
  const ids = new Set<string>();
  const present = new Set<string>();
  const required = new Set(
    Object.entries(registry)
      .filter(([, item]) => item.role === 'required')
      .map(([type]) => type),
  );
  let count = 0;
  let headings = 0;
  let builderComponents = 0;
  const visit = (
    node: TreeNode,
    parent: TreeNode | undefined,
    depth: number,
  ): { code: TreeErrorCode; nodeId?: string } | undefined => {
    count += 1;
    if (count > TREE_LIMITS.nodes || depth > TREE_LIMITS.depth)
      return { code: 'TREE_LIMIT', nodeId: node.id };
    if (ids.has(node.id)) return { code: 'DUPLICATE_ID', nodeId: node.id };
    ids.add(node.id);
    const slot =
      parent?.type === 'page'
        ? ['section']
        : parent?.type === 'section' || parent?.type === 'column'
          ? ['component', 'legacy-component', 'row', 'grid']
          : parent?.type === 'row'
            ? ['column']
            : parent?.type === 'grid'
              ? ['component', 'legacy-component']
              : [];
    if (parent && !slot.includes(node.type)) return { code: 'INVALID_SLOT', nodeId: node.id };
    const props = node.responsive;
    const schema =
      node.type === 'component'
        ? Object.hasOwn(registry, node.componentType!)
          ? registry[node.componentType!]!.props
          : Object.hasOwn(starterComponentSchemas, node.componentType!)
            ? starterComponentSchemas[node.componentType! as keyof typeof starterComponentSchemas]
            : undefined
        : layoutSchemas[node.type];
    if (node.type === 'component' && !schema) return { code: 'UNKNOWN_TYPE', nodeId: node.id };
    if (node.type === 'component') {
      builderComponents += 1;
      present.add(node.componentType!);
    }
    for (const value of Object.values(props)) {
      if (serializedBytes(value)! > TREE_LIMITS.propsBytes)
        return { code: 'TREE_LIMIT', nodeId: node.id };
      if (!exactParse(jsonRecordSchema, value)) return { code: 'INVALID_PROPS', nodeId: node.id };
    }
    if (node.type === 'legacy-component') {
      if (
        !exactParse(z.strictObject({ block: z.json() }), props.base) ||
        Object.keys(props).some((key) => key !== 'base')
      )
        return { code: 'INVALID_PROPS', nodeId: node.id };
    } else if (schema) {
      for (const breakpoint of ['base', 'mobile', 'tablet', 'desktop'] as const) {
        const override = props[breakpoint];
        if (override && !exactParse(schema, { ...props.base, ...override }))
          return { code: 'INVALID_PROPS', nodeId: node.id };
      }
      if (node.type === 'component' && ['button', 'image'].includes(node.componentType!)) {
        for (const breakpoint of ['base', 'mobile', 'tablet', 'desktop'] as const) {
          const resolved = { ...props.base, ...props[breakpoint] };
          const url = node.componentType === 'button' ? resolved.href : resolved.src;
          if (typeof url !== 'string' || !safeUrl(url))
            return { code: 'INVALID_PROPS', nodeId: node.id };
        }
      }
      if (
        node.type === 'component' &&
        (node.componentType === 'heading' || registry[node.componentType!]?.role === 'h1')
      ) {
        if (
          registry[node.componentType!]?.role === 'h1' ||
          ['base', 'mobile', 'tablet', 'desktop'].some(
            (key) => ({ ...props.base, ...props[key as keyof ResponsiveProps] }).level === 1,
          )
        )
          headings += 1;
      }
    }
    const children = node.sections ?? node.content ?? node.columns ?? node.items ?? [];
    if (node.type === 'row' && (children.length < 2 || children.length > 4)) {
      return { code: 'INVALID_SLOT', nodeId: node.id };
    }
    for (const child of children) {
      const error = visit(child, node, depth + 1);
      if (error) return error;
    }
  };
  const error = visit(document.root, undefined, 1);
  if (error) return { ok: false, input, ...error };
  if (
    headings > 1 ||
    (builderComponents > 0 && headings !== 1) ||
    (builderComponents > 0 && [...required].some((type) => !present.has(type)))
  ) {
    return { ok: false, code: 'HEADING_RULE', input };
  }
  return { ok: true, value: document };
}
