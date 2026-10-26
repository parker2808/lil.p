import type { SchemaField } from '@/modules/admin-core/utils/schema-to-fields.util';
import type { editorLabelsFromMessages } from '@/modules/admin-core/utils/editor-labels.util';

export type PreviewLabels = {
  copy: string;
  copied: string;
  wrap: string;
  note: string;
  warning: string;
  anchor: string;
};

export type WidgetLabels = {
  add: string;
  remove: string;
  moveUp: string;
  moveDown: string;
  iconOpen: string;
  iconSearch: string;
  iconEmpty: string;
  hues: {
    JADE: string;
    AMBER: string;
    BLUE: string;
    VIOLET: string;
    ROSE: string;
  };
};

export type ScalarWidgetProps = {
  field: SchemaField;
  value: unknown;
  readOnly: boolean;
  onChange: (value: unknown) => void;
  labels: WidgetLabels;
};

export type LocalizedWidgetProps = {
  field: SchemaField;
  value: { en?: string; vi?: string };
  readOnly: boolean;
  label: string;
  message: string;
  editorLabels: ReturnType<typeof editorLabelsFromMessages>;
  previewLabels: PreviewLabels;
  onChange: (locale: 'en' | 'vi', next: string) => void;
};
