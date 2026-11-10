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
const mobileGridSchema = z.strictObject({ columns: z.number().int().min(1).max(4) });

export function preflightTree(input: unknown): TreeResult<true> {
  const bytes = serializedBytes(input);
  if (bytes === undefined || bytes > TREE_LIMITS.bytes)
    return { ok: false, code: 'TREE_LIMIT', input };
  if (!input || typeof input !== 'object' || !('root' in input))
    return { ok: false, code: 'INVALID_TREE', input };
  const stack: { node: unknown; depth: number }[] = [{ node: input.root, depth: 1 }];
  let count = 0;
  while (stack.length) {
    const { node, depth } = stack.pop()!;
    count += 1;
    if (count > TREE_LIMITS.nodes || depth > TREE_LIMITS.depth)
      return { ok: false, code: 'TREE_LIMIT', input };
    if (!node || typeof node !== 'object' || Array.isArray(node))
      return { ok: false, code: 'INVALID_TREE', input };
    const record = node as Record<string, unknown>;
    for (const slot of ['sections', 'content', 'columns', 'items']) {
      const children = record[slot];
      if (Array.isArray(children)) {
        for (const child of children) stack.push({ node: child, depth: depth + 1 });
      }
    }
    const props = record.responsive ?? record.props;
    if (props && typeof props === 'object') {
      const values: { value: unknown; depth: number }[] = [{ value: props, depth: 0 }];
      const seen = new Set<object>();
      while (values.length) {
        const { value, depth: propsDepth } = values.pop()!;
        if (!value || typeof value !== 'object') continue;
        if (propsDepth > 64) return { ok: false, code: 'TREE_LIMIT', input };
        if (seen.has(value)) continue;
        seen.add(value);
        for (const child of Object.values(value))
          values.push({ value: child, depth: propsDepth + 1 });
      }
    }
  }
  return { ok: true, value: true };
}

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
  const preflight = preflightTree(input);
  if (!preflight.ok) return preflight;
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
  let count = 0;
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
        : parent?.type === 'section'
          ? ['component', 'legacy-component', 'row', 'grid']
          : parent?.type === 'column'
            ? ['component', 'legacy-component']
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
        const effectiveSchema =
          node.type === 'grid' && breakpoint === 'mobile' ? mobileGridSchema : schema;
        if (override && !exactParse(effectiveSchema, { ...props.base, ...override }))
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
    }
    const children =
      node.type === 'page'
        ? node.sections
        : node.type === 'section' || node.type === 'column'
          ? node.content
          : node.type === 'row'
            ? node.columns
            : node.type === 'grid'
              ? node.items
              : [];
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
  return { ok: true, value: document };
}

export function validateTreeForPublish(
  input: unknown,
  registry: ComponentRegistry = {},
): TreeResult<TreeDocument> {
  const draft = readTree(input, registry);
  if (!draft.ok) return draft;
  const present = new Set<string>();
  let headings = 0;
  let builderComponents = 0;
  const stack: TreeNode[] = [draft.value.root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.type === 'component') {
      builderComponents += 1;
      present.add(node.componentType);
      if (
        registry[node.componentType]?.role === 'h1' ||
        (node.componentType === 'heading' &&
          ['base', 'mobile', 'tablet', 'desktop'].some(
            (breakpoint) =>
              ({ ...node.responsive.base, ...node.responsive[breakpoint as keyof ResponsiveProps] })
                .level === 1,
          ))
      )
        headings += 1;
    } else if (node.type === 'page') stack.push(...node.sections);
    else if (node.type === 'section' || node.type === 'column') stack.push(...node.content);
    else if (node.type === 'row') stack.push(...node.columns);
    else if (node.type === 'grid') stack.push(...node.items);
  }
  const required = Object.entries(registry)
    .filter(([, item]) => item.role === 'required')
    .map(([type]) => type);
  if (
    headings > 1 ||
    (builderComponents > 0 && headings !== 1) ||
    (builderComponents > 0 && required.some((type) => !present.has(type)))
  )
    return { ok: false, code: 'HEADING_RULE', input };
  return draft;
}
