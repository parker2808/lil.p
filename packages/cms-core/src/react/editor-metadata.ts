export type EditorMetadata = {
  icon: string;
  labelKey: string;
  descriptionKey: string;
  widgetHints?: Readonly<Record<string, string>>;
};

export function createEditorMetadata<const Type extends string, Value extends EditorMetadata>(
  entries: Record<Type, Value>,
): Readonly<Record<Type, Value>> {
  return entries;
}
