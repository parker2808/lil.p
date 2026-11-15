'use client';

import type { SchemaField } from '@parker2808/cms-core/react';
import {
  resolveResponsive,
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

import type { BuilderState } from '../canvas/commands';
import { findNode } from '../canvas/model';
import {
  candidateProperty,
  initialValue,
  optionalGroups,
  propertyFields,
  propertyJson,
  propertyLabel,
  propertySchema,
  schemaAt,
  setAt,
  valueAt,
} from './editor-model';
import styles from './properties.module.css';

const copy = {
  en: {
    title: 'Properties',
    base: 'Base',
    mobile: 'Mobile',
    tablet: 'Tablet',
    desktop: 'Desktop',
    empty: 'Select a component to edit its properties.',
    unavailable: 'This component has no editable properties.',
    invalid: 'Invalid value; your edit is kept here and has not been saved.',
    inherited: 'Inherited from base',
    override: 'Overridden here',
    clear: 'Clear override',
    add: 'Add',
    english: 'English',
    vietnamese: 'Vietnamese',
    ids: 'Numeric IDs separated by commas',
  },
  vi: {
    title: 'Thuộc tính',
    base: 'Cơ bản',
    mobile: 'Di động',
    tablet: 'Máy tính bảng',
    desktop: 'Máy tính bàn',
    empty: 'Chọn thành phần để chỉnh sửa thuộc tính.',
    unavailable: 'Thành phần này không có thuộc tính chỉnh sửa.',
    invalid: 'Giá trị không hợp lệ; thay đổi được giữ tại đây và chưa được lưu.',
    inherited: 'Kế thừa từ cơ bản',
    override: 'Đã ghi đè ở đây',
    clear: 'Xóa ghi đè',
    add: 'Thêm',
    english: 'Tiếng Anh',
    vietnamese: 'Tiếng Việt',
    ids: 'ID dạng số, cách nhau bằng dấu phẩy',
  },
} as const;

const spacingNames = {
  en: { sm: 'Small', md: 'Medium', lg: 'Large' },
  vi: { sm: 'Nhỏ', md: 'Vừa', lg: 'Lớn' },
} as const;
const choiceNames = {
  en: {
    latest: 'Latest',
    featured: 'Featured',
    manual: 'Manual',
    default: 'Default',
    compact: 'Compact',
  },
  vi: {
    latest: 'Mới nhất',
    featured: 'Nổi bật',
    manual: 'Thủ công',
    default: 'Mặc định',
    compact: 'Thu gọn',
  },
} as const;

function Fields({
  node,
  breakpoint,
  locale,
  onEdit,
}: {
  node: TreeNode;
  breakpoint: Breakpoint;
  locale: 'en' | 'vi';
  onEdit: (operation: TreeOperation, typing?: boolean) => string | undefined;
}) {
  const schema = propertySchema(node);
  const text = copy[locale];
  const descriptors = schema ? propertyFields(schema, locale) : [];
  const json = schema && propertyJson(schema);
  const effective =
    breakpoint === 'base' ? node.responsive.base : resolveResponsive(node.responsive, breakpoint);
  const [pending, setPending] = useState<Record<string, unknown>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function edit(path: string, next: unknown, typing: boolean, leaf?: string, raw?: string) {
    const key = path.split('.')[0]!;
    const candidate = candidateProperty(node, breakpoint, path, next, pending[key]);
    if (leaf && raw !== undefined) setInputs((previous) => ({ ...previous, [leaf]: raw }));
    const parsed = schema!.safeParse({ ...effective, [key]: candidate.value });
    if (!parsed.success) {
      setPending((previous) => ({ ...previous, [key]: candidate.value }));
      setErrors((previous) => ({ ...previous, [leaf ?? path]: true }));
      return;
    }
    const failure = onEdit(
      {
        kind: 'property',
        nodeId: node.id,
        breakpoint,
        key,
        value: candidate.value as Extract<TreeOperation, { kind: 'property' }>['value'],
      },
      typing,
    );
    setPending((previous) => {
      const updated = { ...previous };
      if (failure) updated[key] = candidate.value;
      else delete updated[key];
      return updated;
    });
    setErrors((previous) => ({
      ...Object.fromEntries(
        Object.entries(previous).filter(
          ([entry]) => entry !== path && !entry.startsWith(`${path}.`),
        ),
      ),
      [leaf ?? path]: !!failure,
    }));
    if (!failure)
      setInputs((previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(
            ([entry]) => entry !== path && !entry.startsWith(`${path}.`),
          ),
        ),
      );
  }

  function addGroup(path: string) {
    const key = path.split('.')[0]!;
    const initial = initialValue(schemaAt(json!, path)!);
    const value =
      path === key ? initial : setAt({ [key]: pending[key] ?? effective[key] }, path, initial);
    setPending((previous) => ({ ...previous, [key]: value }));
  }

  function renderField(field: SchemaField) {
    const path = field.path;
    const key = path.split('.')[0]!;
    const current = {
      ...effective,
      ...(Object.hasOwn(pending, key) ? { [key]: pending[key] } : {}),
    };
    const missing = optionalGroups(json!, path).find(
      (group) => valueAt(current, group) === undefined,
    );
    if (missing)
      return {
        group: missing,
        element: (
          <Button
            key={missing}
            type="button"
            variant="outline"
            className={styles.control}
            onClick={() => addGroup(missing)}
          >
            {text.add} · {propertyLabel(missing, locale)}
          </Button>
        ),
      };
    const overridden =
      breakpoint !== 'base' && Object.hasOwn(node.responsive[breakpoint] ?? {}, key);
    const value = valueAt(current, path);
    const localized = ['localized-text', 'localized-textarea', 'markdown'].includes(field.kind);
    const languages: ('en' | 'vi' | undefined)[] = localized ? ['en', 'vi'] : [undefined];
    const controls = languages.map((language) => {
      const leaf = language ? `${path}.${language}` : path;
      const label = language
        ? `${field.label} · ${language === 'en' ? text.english : text.vietnamese}`
        : field.label;
      const id = `builder-field-${node.id}-${breakpoint}-${leaf}`;
      const content = language ? valueAt(current, leaf) : value;
      const input =
        inputs[leaf] ?? (Array.isArray(content) ? content.join(', ') : String(content ?? ''));
      const hasError = errors[leaf];
      function change(next: unknown, typing = false, raw?: string) {
        if (language) {
          const pair = value && typeof value === 'object' ? value : { en: '', vi: '' };
          edit(path, { ...(pair as Record<string, unknown>), [language]: next }, typing, leaf, raw);
        } else edit(path, next, typing, leaf, raw);
      }
      return (
        <div className={styles.field} key={leaf}>
          <div className={styles.fieldHead}>
            <label htmlFor={id}>{label}</label>
            {breakpoint !== 'base' && (
              <span className={styles.source}>{overridden ? text.override : text.inherited}</span>
            )}
          </div>
          {field.kind === 'select' ? (
            <Select value={String(content ?? '')} onValueChange={(next) => change(next)}>
              <SelectTrigger id={id} aria-label={label} className={styles.control}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.enum?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {key === 'size' && option in spacingNames[locale]
                      ? spacingNames[locale][option as keyof typeof spacingNames.en]
                      : option in choiceNames[locale]
                        ? choiceNames[locale][option as keyof typeof choiceNames.en]
                        : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.kind === 'switch' ? (
            <Switch
              id={id}
              checked={Boolean(content)}
              onCheckedChange={(next) => change(next)}
              className={styles.switch}
            />
          ) : field.kind === 'textarea' ||
            field.kind === 'markdown' ||
            field.kind === 'localized-textarea' ||
            (field.kind === 'text' && path === 'text') ? (
            <Textarea
              id={id}
              value={input}
              onChange={(event) => change(event.target.value, true, event.target.value)}
              aria-invalid={!!hasError}
              aria-describedby={hasError ? `${id}-error` : undefined}
              className={styles.control}
            />
          ) : (
            <Input
              id={id}
              type={field.kind === 'number' ? 'number' : 'text'}
              min={field.min}
              max={field.max}
              value={input}
              onChange={(event) => {
                const raw = event.target.value;
                if (field.kind === 'array')
                  change(
                    raw.trim()
                      ? raw.split(',').map((part) => {
                          const token = part.trim();
                          return /^(0|[1-9]\d*)$/.test(token) ? Number(token) : NaN;
                        })
                      : [],
                    true,
                    raw,
                  );
                else if (field.kind === 'number')
                  change(
                    raw === '' && schemaAt(json!, path)?.anyOf?.some((item) => item.type === 'null')
                      ? null
                      : Number(raw),
                    true,
                    raw,
                  );
                else change(raw, true, raw);
              }}
              aria-invalid={!!hasError}
              aria-describedby={hasError ? `${id}-error` : undefined}
              placeholder={field.kind === 'array' ? text.ids : undefined}
              className={styles.control}
            />
          )}
          {hasError && (
            <p className={styles.error} id={`${id}-error`} role="alert">
              {text.invalid}
            </p>
          )}
        </div>
      );
    });
    return {
      group: undefined,
      element: (
        <div key={path} className={styles.group}>
          {controls}
          {overridden && (
            <Button
              type="button"
              variant="ghost"
              className={styles.clear}
              onClick={() => {
                const failure = onEdit({
                  kind: 'clear-override',
                  nodeId: node.id,
                  breakpoint,
                  key,
                });
                if (failure) {
                  setErrors((previous) => ({ ...previous, [path]: true }));
                  return;
                }
                setPending((previous) => {
                  const updated = { ...previous };
                  delete updated[key];
                  return updated;
                });
              }}
            >
              {text.clear} · {field.label}
            </Button>
          )}
        </div>
      ),
    };
  }

  const seen = new Set<string>();
  return (
    <>
      {!descriptors.length && <p className={styles.helper}>{text.unavailable}</p>}
      {descriptors.map((field) => {
        const result = renderField(field);
        if (result.group) {
          if (seen.has(result.group)) return null;
          seen.add(result.group);
        }
        return result.element;
      })}
    </>
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
  const text = copy[locale];
  return (
    <div className={styles.panel} aria-label={text.title}>
      <div
        className={styles.breakpoints}
        role="group"
        aria-label={locale === 'vi' ? 'Điểm ngắt' : 'Breakpoint'}
      >
        {(['base', 'mobile', 'tablet', 'desktop'] as const).map((size) => (
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
            ? node.componentType.replaceAll('-', ' ')
            : node.type
          : text.empty}
      </p>
      {node ? (
        <Fields
          key={`${node.id}-${breakpoint}`}
          node={node}
          breakpoint={breakpoint}
          locale={locale}
          onEdit={onEdit}
        />
      ) : (
        <p className={styles.helper}>{text.empty}</p>
      )}
    </div>
  );
}
