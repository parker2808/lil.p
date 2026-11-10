import { schemaToFields as coreSchemaToFields } from '@parker2808/cms-core/react';
import type { SchemaFieldKind } from '@parker2808/cms-core/react';
import type { ZodType } from 'zod';

export type { SchemaField, SchemaFieldKind } from '@parker2808/cms-core/react';

const WIDGET_KINDS: Readonly<Record<string, SchemaFieldKind>> = {
  icon: 'icon',
  hue: 'hue',
  route: 'route',
  project: 'number',
  projectIds: 'array',
  statIds: 'array',
  tag: 'tag',
  domain: 'tag',
};

export function schemaToFields(
  schema: ZodType,
  labelFor: (path: string, key: string | undefined) => string,
) {
  return coreSchemaToFields(schema, { labelFor, widgetKinds: WIDGET_KINDS });
}
