import type { Locale, PublicBlock } from '@parker2808/cms-core/contracts';
import {
  checkBlockLimit,
  checkBlockRole,
  nextBlockKey,
  orderBlocks,
} from '@parker2808/cms-core/engine';
import {
  createEditorMetadata,
  fieldMessage,
  type SchemaField,
  SchemaFieldControl,
  SchemaForm,
  schemaToFields,
  type WidgetControl,
  type WidgetRegistry,
} from '@parker2808/cms-core/react';
import { type ReactNode, useState } from 'react';

import { block, type BlockType, blockTypes, copy, registry, sampleBlocks } from './content';
import { PageBlocks } from './render';

const metadata = createEditorMetadata({
  heading: { icon: 'H', labelKey: 'heading', descriptionKey: 'headingDescription' },
  paragraph: { icon: '¶', labelKey: 'paragraph', descriptionKey: 'paragraphDescription' },
  action: { icon: '↗', labelKey: 'action', descriptionKey: 'actionDescription' },
  image: { icon: '▧', labelKey: 'image', descriptionKey: 'imageDescription' },
});

type OrderedPublicBlock = PublicBlock & { sortOrder: number };

export function Editor({ locale }: { locale: Locale }) {
  const words = copy[locale];
  const [blocks, setBlocks] = useState<OrderedPublicBlock[]>(() =>
    sampleBlocks(locale).map((item, index) => ({ ...item, sortOrder: index })),
  );
  const [selectedId, setSelectedId] = useState(1);
  const [choice, setChoice] = useState<BlockType>('paragraph');
  const ordered = orderBlocks(blocks);
  const selected = ordered.find((item) => item.id === selectedId);
  const selectedType = selected?.type as BlockType | undefined;
  const fields = selectedType
    ? schemaToFields(registry[selectedType].props, {
        widgetKinds: { longtext: 'localized-textarea' },
        labelFor: (path) => {
          const label = path.split('.').at(-1);
          const localized = (
            {
              title: words.heading,
              body: words.paragraph,
              label: words.action,
              href: words.action,
              alt: words.image,
              src: words.image,
            } as Record<string, string>
          )[label ?? ''];
          if (!localized) throw new Error(`Missing ${locale} label for ${path}`);
          return localized;
        },
      })
    : [];

  const widgets: WidgetRegistry<ReactNode> = {
    localized: (control) => <LocalizedInput {...control} locale={locale} />,
    array: (control) => <ScalarInput {...control} />,
    scalar: (control) => <ScalarInput {...control} />,
  };

  function edit(field: SchemaField, value: unknown) {
    setBlocks((current) =>
      current.map((item) =>
        item.id === selectedId ? { ...item, props: { ...item.props, [field.path]: value } } : item,
      ),
    );
  }

  function add() {
    const definition = registry[choice];
    if (checkBlockLimit(definition, blocks.filter((item) => item.type === choice).length)) return;
    const id = Math.max(0, ...blocks.map((item) => item.id)) + 1;
    const item: OrderedPublicBlock = {
      ...block(choice, id, blocks.length, locale),
      key: nextBlockKey(
        choice,
        blocks.map((existing) => existing.key),
      ),
      sortOrder: blocks.length,
    };
    setBlocks((current) => [...current, item]);
    setSelectedId(id);
  }

  function move(id: number, direction: -1 | 1) {
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + direction;
    if (to < 0 || to >= ordered.length) return;
    const moved = [...ordered];
    [moved[from], moved[to]] = [moved[to], moved[from]];
    setBlocks(moved.map((item, index) => ({ ...item, sortOrder: index })));
  }

  function remove() {
    if (!selected || checkBlockRole(registry[selected.type as BlockType], 'delete')) return;
    const remaining = ordered.filter((item) => item.id !== selectedId);
    setBlocks(remaining.map((item, index) => ({ ...item, sortOrder: index })));
    setSelectedId(remaining[0]?.id ?? 0);
  }

  return (
    <div className="fixture-editor">
      <section aria-labelledby="editor-title" className="fixture-panel fixture-outline">
        <h2 id="editor-title">{words.editor}</h2>
        <p className="fixture-hint">{words.reorderHelp}</p>
        <ol aria-label={words.editor} className="fixture-outline-list">
          {ordered.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className="fixture-outline-item"
                aria-current={item.id === selectedId ? 'true' : undefined}
                onClick={() => setSelectedId(item.id)}
                onKeyDown={(event) => {
                  if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
                  event.preventDefault();
                  move(item.id, event.key === 'ArrowUp' ? -1 : 1);
                }}
              >
                <span aria-hidden="true">{metadata[item.type as BlockType]?.icon ?? '·'}</span>
                <span>
                  {index + 1}. {words[item.type as BlockType] ?? words.unknownBlock}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="fixture-add">
          <label htmlFor="block-choice">{words.add}</label>
          <select
            id="block-choice"
            value={choice}
            onChange={(event) => setChoice(event.target.value as BlockType)}
          >
            {blockTypes.map((type) => (
              <option
                key={type}
                value={type}
                disabled={Boolean(
                  checkBlockLimit(
                    registry[type],
                    blocks.filter((item) => item.type === type).length,
                  ),
                )}
              >
                {words[type]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            disabled={Boolean(
              checkBlockLimit(
                registry[choice],
                blocks.filter((item) => item.type === choice).length,
              ),
            )}
          >
            {words.add}
          </button>
        </div>
      </section>
      <section className="fixture-panel fixture-live" aria-labelledby="preview-title">
        <div className="fixture-panel-heading">
          <h2 id="preview-title">{words.preview}</h2>
          <span className="fixture-hint">{words.noSave}</span>
        </div>
        <PageBlocks locale={locale} blocks={ordered} draft />
      </section>
      <section className="fixture-panel fixture-properties" aria-labelledby="properties-title">
        <h2 id="properties-title">{words.fields}</h2>
        {selected ? (
          <>
            <div className="fixture-toolbar">
              <button
                type="button"
                aria-label={words.moveUp}
                disabled={ordered[0]?.id === selectedId}
                onClick={() => move(selectedId, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={words.moveDown}
                disabled={ordered.at(-1)?.id === selectedId}
                onClick={() => move(selectedId, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                disabled={Boolean(checkBlockRole(registry[selectedType!], 'delete'))}
                onClick={remove}
              >
                {words.remove}
              </button>
            </div>
            <SchemaForm
              fields={fields}
              renderField={(field) => (
                <div className="fixture-field" key={field.path}>
                  {SchemaFieldControl({
                    field,
                    value: selected.props[field.path],
                    label: field.label,
                    issue: !selected.props[field.path] ? { message: words.validation } : undefined,
                    fieldErrors: {},
                    readOnly: false,
                    onChange: (value) => edit(field, value),
                    widgets,
                  })}
                  {!selected.props[field.path] && (
                    <p className="fixture-error" role="alert">
                      {fieldMessage(field, { message: words.validation })}
                    </p>
                  )}
                </div>
              )}
            />
            {selectedType === 'heading' && <p className="fixture-hint">{words.required}</p>}
          </>
        ) : (
          <p>{words.empty}</p>
        )}
      </section>
    </div>
  );
}

function LocalizedInput({
  field,
  value,
  label,
  onChange,
  locale,
}: WidgetControl & { locale: Locale }) {
  const words = copy[locale];
  const localized = (value ?? { en: '', vi: '' }) as Record<Locale, string>;
  return (
    <fieldset className="fixture-localized">
      <legend>{label}</legend>
      {(['en', 'vi'] as const).map((language) => (
        <label key={language} htmlFor={`${field.path}-${language}`}>
          {language.toUpperCase()}
          {field.kind === 'localized-textarea' ? (
            <textarea
              id={`${field.path}-${language}`}
              aria-label={`${label} · ${language.toUpperCase()}`}
              lang={language}
              rows={4}
              value={localized[language]}
              onChange={(event) => onChange({ ...localized, [language]: event.target.value })}
            />
          ) : (
            <input
              id={`${field.path}-${language}`}
              aria-label={`${label} · ${language.toUpperCase()}`}
              lang={language}
              value={localized[language]}
              onChange={(event) => onChange({ ...localized, [language]: event.target.value })}
            />
          )}
        </label>
      ))}
      <span className="fixture-hint">{words.noSave}</span>
    </fieldset>
  );
}

function ScalarInput({ field, value, label, onChange }: WidgetControl) {
  return (
    <label htmlFor={field.path}>
      {label}
      <input
        id={field.path}
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
