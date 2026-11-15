'use client';

import { schemaToFields, type SchemaField } from '@parker2808/cms-core/react';
import {
  resolveResponsive,
  starterComponentSchemas,
  type Breakpoint,
  type TreeNode,
  type TreeOperation,
} from '@parker2808/cms-core/tree';
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
    return starterComponentSchemas[node.componentType as keyof typeof starterComponentSchemas];
  if (node.type === 'grid' || node.type === 'column') return layoutSchemas[node.type];
  return undefined;
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
  const value = current[key];
  const overridden = breakpoint !== 'base' && Object.hasOwn(node.responsive[breakpoint] ?? {}, key);
  const [draft, setDraft] = useState<{ source: string; input: string } | null>(null);
  const [error, setError] = useState('');
  const source = String(value ?? '');
  const shown = draft?.source === source ? draft.input : source;
  function update(next: string | number | boolean, typing = false) {
    setDraft({ source, input: String(next) });
    setError(
      onEdit({ kind: 'property', nodeId: node.id, breakpoint, key, value: next }, typing)
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
              key,
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
}: {
  state: BuilderState;
  locale: 'en' | 'vi';
  onEdit: (operation: TreeOperation, typing?: boolean) => string | undefined;
}) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');
  const node = findNode(state.document, state.selectedId);
  const schema = node && schemaFor(node);
  const text = fields[locale];
  const descriptors = schema
    ? schemaToFields(schema, {
        labelFor: (path) => (path in text ? text[path as keyof typeof text] : ''),
      })
    : [];
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
            ? (nodeNames[locale][node.componentType as keyof typeof nodeNames.en] ??
              node.componentType)
            : nodeNames[locale][node.type]
          : text.empty}
      </p>
      {!descriptors.length && (
        <p className={styles.helper}>{node ? text.unavailable : text.empty}</p>
      )}
      {node &&
        descriptors.map((field) => (
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
