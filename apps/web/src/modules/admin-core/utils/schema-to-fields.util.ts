import { z, type ZodType } from 'zod';

export type SchemaFieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'select'
  | 'localized-text'
  | 'localized-textarea'
  | 'markdown'
  | 'icon'
  | 'hue'
  | 'route'
  | 'project'
  | 'projects'
  | 'stats'
  | 'tag'
  | 'array';

export type SchemaField = {
  path: string;
  kind: SchemaFieldKind;
  required: boolean;
  label: string;
  min?: number;
  max?: number;
  enum?: string[];
  default?: unknown;
  widget?: string;
  item?: SchemaField;
  fields?: SchemaField[];
};

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  widget?: string;
  label?: string;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
};

const WIDGET_KIND: Record<string, SchemaFieldKind> = {
  text: 'text',
  textarea: 'textarea',
  number: 'number',
  toggle: 'switch',
  switch: 'switch',
  select: 'select',
  markdown: 'markdown',
  icon: 'icon',
  hue: 'hue',
  route: 'route',
  project: 'project',
  projects: 'projects',
  projectIds: 'projects',
  stats: 'stats',
  statIds: 'stats',
  tag: 'tag',
  domain: 'tag',
};

function unwrap(node: JsonSchema): JsonSchema {
  const union = node.anyOf ?? node.oneOf;
  if (union) {
    const useful = union.find((part) => part.type !== 'null');
    if (useful) {
      return unwrap({
        ...useful,
        widget: node.widget ?? useful.widget,
        label: node.label ?? useful.label,
      });
    }
  }
  const types = Array.isArray(node.type) ? node.type.filter((type) => type !== 'null') : node.type;
  return { ...node, type: Array.isArray(types) ? types[0] : types };
}

function isLocalized(node: JsonSchema): boolean {
  const keys = Object.keys(node.properties ?? {});
  return keys.length === 2 && keys.includes('en') && keys.includes('vi');
}

function kindFor(node: JsonSchema, path: string): SchemaFieldKind {
  if (node.widget) {
    const mapped = WIDGET_KIND[node.widget];
    if (mapped) {
      return mapped;
    }
  }
  if (isLocalized(node)) {
    const enWidget = node.properties?.en?.widget;
    if (enWidget === 'markdown') {
      return 'markdown';
    }
    if (enWidget === 'textarea') {
      return 'localized-textarea';
    }
    return 'localized-text';
  }
  if (node.enum || node.const !== undefined) {
    return 'select';
  }
  if (node.type === 'boolean') {
    return 'switch';
  }
  if (node.type === 'integer' || node.type === 'number') {
    return 'number';
  }
  if (node.type === 'string') {
    return 'text';
  }
  if (node.type === 'array') {
    return 'array';
  }
  if (node.type === 'object' && node.properties) {
    return 'array';
  }
  throw new Error(`Unknown schema field at ${path || '<root>'}: ${JSON.stringify(node)}`);
}

function walk(node: JsonSchema, path: string, required: boolean): SchemaField[] {
  const current = unwrap(node);
  if (current.type === 'object' && current.properties && !isLocalized(current)) {
    return Object.entries(current.properties).flatMap(([key, child]) =>
      walk(child, path ? `${path}.${key}` : key, Boolean(current.required?.includes(key))),
    );
  }

  const kind = kindFor(current, path);
  const field: SchemaField = {
    path,
    kind,
    required,
    label: current.label ?? (isLocalized(current) ? (current.properties?.en?.label ?? path) : path),
    min: current.minimum ?? current.minLength,
    max: current.maximum ?? current.maxLength,
    enum: (current.enum ?? (current.const !== undefined ? [current.const] : undefined)) as
      string[] | undefined,
    default: current.default,
    widget: current.widget,
  };

  if (kind === 'array' && current.items) {
    const itemFields = walk(current.items, `${path}[]`, true);
    field.item = itemFields[0];
    field.fields = itemFields;
  }

  return [field];
}

export function schemaToFields(schema: ZodType): SchemaField[] {
  const json = z.toJSONSchema(schema, { io: 'input' }) as JsonSchema;
  if (json.type !== 'object' || !json.properties) {
    throw new Error('Block props schema must be an object');
  }
  return walk(json, '', true).filter((field) => field.path.length > 0);
}
