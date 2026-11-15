'use client';

import { schemaToFields, type SchemaField } from '@parker2808/cms-core/react';
import {
  resolveResponsive,
  starterComponentSchemas,
  type Breakpoint,
  type TreeNode,
  type TreeOperation,
} from '@parker2808/cms-core/tree';
import { BLOCK_REGISTRY, type BlockType } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { findNode } from '../canvas/model';
import type { BuilderState } from '../canvas/commands';
import styles from './properties.module.css';

const fields = {
  en: {
    title: 'Properties',
    base: 'Base',
    tablet: 'Tablet',
    mobile: 'Mobile',
    inherited: 'Inherited from base',
    override: 'Overridden here',
    clear: 'Clear override',
    empty: 'Select a component to edit its properties.',
    invalid: 'This value is not valid for this component.',
    unavailable: 'This component has no editable properties.',
    text: 'Text',
    level: 'Heading level',
    src: 'Image URL',
    alt: 'Alternative text',
    label: 'Button label',
    href: 'Link URL',
    size: 'Spacing',
    columns: 'Columns',
    span: 'Column span',
  },
  vi: {
    title: 'Thuộc tính',
    base: 'Cơ bản',
    tablet: 'Máy tính bảng',
    mobile: 'Di động',
    inherited: 'Kế thừa từ cơ bản',
    override: 'Đã ghi đè ở đây',
    clear: 'Xóa ghi đè',
    empty: 'Chọn thành phần để chỉnh sửa thuộc tính.',
    invalid: 'Giá trị này không hợp lệ cho thành phần.',
    unavailable: 'Thành phần này không có thuộc tính chỉnh sửa.',
    text: 'Văn bản',
    level: 'Cấp tiêu đề',
    src: 'URL hình ảnh',
    alt: 'Văn bản thay thế',
    label: 'Nhãn nút',
    href: 'URL liên kết',
    size: 'Khoảng cách',
    columns: 'Số cột',
    span: 'Độ rộng cột',
  },
} as const;
const nodeNames = {
  en: {
    page: 'Page',
    section: 'Section',
    row: 'Row',
    column: 'Column',
    grid: 'Grid',
    heading: 'Heading',
    paragraph: 'Paragraph',
    'rich-text': 'Rich text',
    image: 'Image',
    button: 'Button',
    divider: 'Divider',
    spacer: 'Spacer',
    'legacy-component': 'Legacy component',
  },
  vi: {
    page: 'Trang',
    section: 'Phần',
    row: 'Hàng',
    column: 'Cột',
    grid: 'Lưới',
    heading: 'Tiêu đề',
    paragraph: 'Đoạn văn',
    'rich-text': 'Văn bản phong phú',
    image: 'Hình ảnh',
    button: 'Nút',
    divider: 'Đường kẻ',
    spacer: 'Khoảng cách',
    'legacy-component': 'Thành phần cũ',
  },
} as const;
const spacingNames = {
  en: { sm: 'Small', md: 'Medium', lg: 'Large' },
  vi: { sm: 'Nhỏ', md: 'Vừa', lg: 'Lớn' },
} as const;

const layoutSchemas = {
  grid: z.strictObject({ columns: z.number().int().min(1).max(4) }),
  column: z.strictObject({ span: z.number().int().min(1).max(4) }),
};

function schemaFor(node: TreeNode) {
  if (node.type === 'component')
    return node.componentType in BLOCK_REGISTRY
      ? BLOCK_REGISTRY[node.componentType as BlockType].props
      : starterComponentSchemas[node.componentType as keyof typeof starterComponentSchemas];
  if (node.type === 'grid' || node.type === 'column') return layoutSchemas[node.type];
  return undefined;
}

function nestedValue(props: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, part) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined,
      props,
    );
}

function propertyChange(
  props: Record<string, unknown>,
  path: string,
  value: string | number | boolean,
): { key: string; value: Extract<TreeOperation, { kind: 'property' }>['value'] } {
  const [key, ...parts] = path.split('.');
  if (!key) throw new Error('Property path must not be empty');
  if (!parts.length) return { key, value };
  const root = structuredClone(props[key] ?? {}) as Record<string, unknown>;
  let target = root;
  for (const part of parts.slice(0, -1)) {
    target[part] = structuredClone(target[part] ?? {});
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]!] = value;
  return { key, value: root as Extract<TreeOperation, { kind: 'property' }>['value'] };
}

function EditorField({
  node,
  field,
  breakpoint,
  locale,
  onEdit,
}: {
  node: TreeNode;
  field: SchemaField;
  breakpoint: Breakpoint;
  locale: 'en' | 'vi';
  onEdit: (operation: TreeOperation, typing?: boolean) => string | undefined;
}) {
  const text = fields[locale];
  const key = field.path;
  const current =
    breakpoint === 'base' ? node.responsive.base : resolveResponsive(node.responsive, breakpoint);
  const [rootKey] = key.split('.');
  const value = nestedValue(current, key);
  const overridden =
    breakpoint !== 'base' && Object.hasOwn(node.responsive[breakpoint] ?? {}, rootKey!);
  const [draft, setDraft] = useState<{ source: string; input: string } | null>(null);
  const [error, setError] = useState('');
  const source = String(value ?? '');
  const shown = draft?.source === source ? draft.input : source;
  function update(next: string | number | boolean, typing = false) {
    setDraft({ source, input: String(next) });
    setError(
      onEdit(
        { kind: 'property', nodeId: node.id, breakpoint, ...propertyChange(current, key, next) },
        typing,
      )
        ? text.invalid
        : '',
    );
  }
  const id = `builder-field-${node.id}-${breakpoint}-${key}`;
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <label htmlFor={id}>{field.label}</label>
        {breakpoint !== 'base' && (
          <span className={styles.source}>{overridden ? text.override : text.inherited}</span>
        )}
      </div>
      {field.kind === 'select' ? (
        <Select value={String(value ?? '')} onValueChange={(next) => update(next)}>
          <SelectTrigger id={id} aria-label={field.label} className={styles.control}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.enum?.map((option) => (
              <SelectItem key={option} value={option}>
                {key === 'size' && option in spacingNames[locale]
                  ? spacingNames[locale][option as keyof (typeof spacingNames)['en']]
                  : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.kind === 'switch' ? (
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(next) => update(next)}
          className={styles.switch}
        />
      ) : field.kind === 'textarea' || (field.kind === 'text' && key === 'text') ? (
        <Textarea
          id={id}
          value={shown}
          onChange={(event) => update(event.target.value, true)}
          onBlur={() => setDraft(null)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={styles.control}
        />
      ) : (
        <Input
          id={id}
          type={field.kind === 'number' ? 'number' : 'text'}
          min={field.min}
          max={field.max}
          value={shown}
          onChange={(event) =>
            update(
              field.kind === 'number' ? Number(event.target.value) : event.target.value,
              field.kind !== 'number',
            )
          }
          onBlur={() => setDraft(null)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={styles.control}
        />
      )}
      {error && (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {overridden && (
        <Button
          type="button"
          variant="ghost"
          className={styles.clear}
          onClick={() => {
            onEdit({
              kind: 'clear-override',
              nodeId: node.id,
              breakpoint: breakpoint as Exclude<Breakpoint, 'base'>,
              key: rootKey!,
            });
            setDraft(null);
          }}
        >
          {text.clear} · {field.label}
        </Button>
      )}
    </div>
  );
}

export function PropertiesPanel({
  state,
  locale,
  onEdit,
  hostLabel,
}: {
  state: BuilderState;
  locale: 'en' | 'vi';
  onEdit: (operation: TreeOperation, typing?: boolean) => string | undefined;
  hostLabel?: (type: BlockType) => string;
}) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');
  const translate = useTranslations();
  const node = findNode(state.document, state.selectedId);
  const schema = node && schemaFor(node);
  const text = fields[locale];
  const descriptors = schema
    ? schemaToFields(schema, {
        labelFor: (path, key) => {
          if (key?.startsWith('admin.blocks.'))
            return translate(key as Parameters<typeof translate>[0]);
          if (key) return key;
          const leaf = path.split('.').at(-1)!;
          return leaf in text
            ? text[leaf as keyof typeof text]
            : leaf.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
        },
      })
    : [];
  const current =
    node &&
    (breakpoint === 'base' ? node.responsive.base : resolveResponsive(node.responsive, breakpoint));
  const editable = descriptors.flatMap((field) => {
    if (
      field.kind === 'array' ||
      (field.path.includes('.') &&
        nestedValue(current ?? {}, field.path.split('.').slice(0, -1).join('.')) === undefined)
    )
      return [];
    if (['localized-text', 'localized-textarea', 'markdown'].includes(field.kind)) {
      return (['en', 'vi'] as const).map((language) => ({
        ...field,
        path: `${field.path}.${language}`,
        label: field.path.startsWith('heading.')
          ? `${locale === 'vi' ? 'Tiêu đề mục' : 'Section heading'} · ${field.label} · ${language === 'en' ? (locale === 'vi' ? 'Tiếng Anh' : 'English') : locale === 'vi' ? 'Tiếng Việt' : 'Vietnamese'}`
          : `${field.label} (${language.toUpperCase()})`,
        kind: field.kind === 'localized-text' ? 'text' : 'textarea',
      }));
    }
    return [field];
  });
  const canAddHeading =
    node?.type === 'component' &&
    node.componentType in BLOCK_REGISTRY &&
    descriptors.some((field) => field.path === 'heading.title') &&
    nestedValue(current ?? {}, 'heading') === undefined;
  return (
    <div className={styles.panel} aria-label={text.title}>
      <div
        className={styles.breakpoints}
        role="group"
        aria-label={locale === 'vi' ? 'Điểm ngắt' : 'Breakpoint'}
      >
        {(['base', 'tablet', 'mobile'] as const).map((size) => (
          <Button
            key={size}
            type="button"
            variant={breakpoint === size ? 'default' : 'outline'}
            aria-pressed={breakpoint === size}
            className={styles.breakpoint}
            onClick={() => setBreakpoint(size)}
          >
            {text[size]}
          </Button>
        ))}
      </div>
      <p className={styles.heading}>
        {node
          ? node.type === 'component'
            ? node.componentType in BLOCK_REGISTRY
              ? (hostLabel?.(node.componentType as BlockType) ?? node.componentType)
              : (nodeNames[locale][node.componentType as keyof typeof nodeNames.en] ??
                node.componentType)
            : nodeNames[locale][node.type]
          : text.empty}
      </p>
      {!editable.length && !canAddHeading && (
        <p className={styles.helper}>{node ? text.unavailable : text.empty}</p>
      )}
      {canAddHeading && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onEdit({
              kind: 'property',
              nodeId: node.id,
              breakpoint,
              key: 'heading',
              value: { title: { en: 'Section heading', vi: 'Tiêu đề mục' } },
            })
          }
        >
          {locale === 'vi' ? 'Thêm tiêu đề' : 'Add heading'}
        </Button>
      )}
      {node &&
        editable.map((field) => (
          <EditorField
            key={`${node.id}-${breakpoint}-${field.path}`}
            node={node}
            field={field}
            breakpoint={breakpoint}
            locale={locale}
            onEdit={onEdit}
          />
        ))}
    </div>
  );
}
