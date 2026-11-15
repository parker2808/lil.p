import { schemaToFields, type SchemaField } from '@parker2808/cms-core/react';
import { type Breakpoint, type TreeNode } from '@parker2808/cms-core/tree';
import { z, type ZodType } from 'zod';

import { builderRegistry } from './registry';

type JsonField = {
  type?: string;
  properties?: Record<string, JsonField>;
  required?: string[];
  items?: JsonField;
  enum?: unknown[];
  default?: unknown;
  anyOf?: JsonField[];
};

const labels = {
  en: {
    text: 'Text',
    level: 'Heading level',
    src: 'Image URL',
    alt: 'Alternative text',
    label: 'Label',
    href: 'Link URL',
    size: 'Spacing',
    columns: 'Columns',
    span: 'Column span',
    heading: 'Heading',
    title: 'Title',
    eyebrow: 'Eyebrow',
    intro: 'Introduction',
    body: 'Body',
    aside: 'Aside',
    link: 'Link',
    primaryCta: 'Primary action',
    secondaryCta: 'Secondary action',
    iconKey: 'Icon',
    variant: 'Variant',
    statIds: 'Statistic IDs',
    projectIds: 'Project IDs',
    projectId: 'Project ID',
    domainSlug: 'Domain',
    source: 'Source',
    limit: 'Limit',
    tag: 'Tag',
    pageSize: 'Page size',
    showDiagram: 'Show diagram',
    showAvailability: 'Show availability',
    showEmail: 'Show email',
    showSocial: 'Show social',
    showPrinciples: 'Show principles',
    showCity: 'Show city',
    showFeatured: 'Show featured',
  },
  vi: {
    text: 'Văn bản',
    level: 'Cấp tiêu đề',
    src: 'URL hình ảnh',
    alt: 'Văn bản thay thế',
    label: 'Nhãn',
    href: 'URL liên kết',
    size: 'Khoảng cách',
    columns: 'Số cột',
    span: 'Độ rộng cột',
    heading: 'Tiêu đề mục',
    title: 'Tiêu đề',
    eyebrow: 'Dòng dẫn',
    intro: 'Giới thiệu',
    body: 'Nội dung',
    aside: 'Nội dung bên cạnh',
    link: 'Liên kết',
    primaryCta: 'Hành động chính',
    secondaryCta: 'Hành động phụ',
    iconKey: 'Biểu tượng',
    variant: 'Kiểu hiển thị',
    statIds: 'ID chỉ số',
    projectIds: 'ID dự án',
    projectId: 'ID dự án',
    domainSlug: 'Lĩnh vực',
    source: 'Nguồn',
    limit: 'Giới hạn',
    tag: 'Thẻ',
    pageSize: 'Số mục mỗi trang',
    showDiagram: 'Hiện sơ đồ',
    showAvailability: 'Hiện tình trạng nhận việc',
    showEmail: 'Hiện email',
    showSocial: 'Hiện mạng xã hội',
    showPrinciples: 'Hiện nguyên tắc',
    showCity: 'Hiện thành phố',
    showFeatured: 'Hiện mục nổi bật',
  },
} as const;

export function propertySchema(node: TreeNode): ZodType | undefined {
  if (node.type === 'component') return builderRegistry[node.componentType]?.props;
  if (node.type === 'grid') return z.strictObject({ columns: z.number().int().min(1).max(4) });
  if (node.type === 'column') return z.strictObject({ span: z.number().int().min(1).max(4) });
}

export function propertyLabel(path: string, locale: 'en' | 'vi'): string {
  return path
    .split('.')
    .map((part) => labels[locale][part as keyof typeof labels.en] ?? part)
    .join(' · ');
}

export function propertyFields(schema: ZodType, locale: 'en' | 'vi'): SchemaField[] {
  return schemaToFields(schema, { labelFor: (path) => propertyLabel(path, locale) });
}

export function propertyJson(schema: ZodType): JsonField {
  return z.toJSONSchema(schema, { io: 'input' }) as JsonField;
}

export function schemaAt(root: JsonField, path: string): JsonField | undefined {
  return path
    .split('.')
    .reduce<JsonField | undefined>((part, key) => part?.properties?.[key], root);
}

export function optionalGroups(root: JsonField, path: string): string[] {
  const parts = path.split('.');
  const groups: string[] = [];
  let parent = root;
  parts.slice(0, -1).forEach((key, index) => {
    if (!parent.required?.includes(key)) groups.push(parts.slice(0, index + 1).join('.'));
    parent = parent.properties?.[key] ?? {};
  });
  return groups;
}

export function valueAt(value: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (part, key) =>
        part && typeof part === 'object' && !Array.isArray(part)
          ? (part as Record<string, unknown>)[key]
          : undefined,
      value,
    );
}

export function setAt(value: Record<string, unknown>, path: string, next: unknown): unknown {
  const [first, ...rest] = path.split('.');
  if (!first) throw new Error('Empty property path');
  if (!rest.length) return next;
  const existing = valueAt(value, first);
  const copy =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  let cursor = copy;
  for (const key of rest.slice(0, -1)) {
    const child = cursor[key];
    cursor[key] =
      child && typeof child === 'object' && !Array.isArray(child)
        ? { ...(child as Record<string, unknown>) }
        : {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[rest.at(-1)!] = next;
  return copy;
}

export function initialValue(field: JsonField): unknown {
  if (field.default !== undefined) return field.default;
  if (field.enum?.length) return field.enum[0];
  if (field.type === 'array') return [];
  if (field.type === 'object')
    return Object.fromEntries(
      Object.entries(field.properties ?? {})
        .filter(([key, child]) => field.required?.includes(key) || child.default !== undefined)
        .map(([key, child]) => [key, initialValue(child)]),
    );
  if (field.type === 'boolean') return false;
  if (field.type === 'number' || field.type === 'integer') return 0;
  return '';
}

export function candidateProperty(
  node: TreeNode,
  breakpoint: Breakpoint,
  path: string,
  next: unknown,
  pending?: unknown,
): { key: string; value: unknown } {
  const key = path.split('.')[0]!;
  const current =
    breakpoint === 'base'
      ? node.responsive.base
      : { ...node.responsive.base, ...node.responsive[breakpoint] };
  const base = pending === undefined ? current[key] : pending;
  const nested = path.slice(key.length + 1);
  return { key, value: nested ? setAt({ [key]: base }, path, next) : next };
}
