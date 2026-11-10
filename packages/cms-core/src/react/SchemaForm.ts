import type { SchemaField } from './fields';

export type WidgetControl = {
  field: SchemaField;
  value: unknown;
  label: string;
  message: string;
  readOnly: boolean;
  onChange: (value: unknown) => void;
};

export type WidgetRegistry<Node> = {
  localized: (control: WidgetControl) => Node;
  array: (control: WidgetControl) => Node;
  scalar: (control: WidgetControl) => Node;
};

export function SchemaForm<Node>({
  fields,
  renderField,
}: {
  fields: readonly SchemaField[];
  renderField: (field: SchemaField) => Node;
}): Node[] {
  return fields.map(renderField);
}

export function fieldMessage(
  field: SchemaField,
  issue: unknown,
  fieldErrors: Readonly<Record<string, string>> = {},
): string {
  const serverError =
    fieldErrors[field.path] ??
    fieldErrors[`props.${field.path}`] ??
    fieldErrors[`${field.path}.en`] ??
    fieldErrors[`props.${field.path}.en`];
  if (serverError !== undefined) return serverError;
  if (typeof issue === 'string') return issue;
  if (issue && typeof issue === 'object' && 'message' in issue) {
    return String(issue.message);
  }
  return '';
}

export function SchemaFieldControl<Node>({
  field,
  value,
  label,
  issue,
  fieldErrors,
  readOnly,
  onChange,
  widgets,
}: Omit<WidgetControl, 'message'> & {
  issue?: unknown;
  fieldErrors?: Readonly<Record<string, string>>;
  widgets: WidgetRegistry<Node>;
}): Node {
  const control: WidgetControl = {
    field,
    value,
    label,
    message: fieldMessage(field, issue, fieldErrors),
    readOnly,
    onChange,
  };
  if (
    field.kind === 'localized-text' ||
    field.kind === 'localized-textarea' ||
    field.kind === 'markdown'
  ) {
    return widgets.localized(control);
  }
  if (field.kind === 'array' || field.kind === 'projects' || field.kind === 'stats') {
    return widgets.array(control);
  }
  return widgets.scalar(control);
}
