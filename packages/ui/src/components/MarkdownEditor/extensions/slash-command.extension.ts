import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

import { type SlashItem, SlashMenu } from '../components/SlashMenu/SlashMenu';
import type { MarkdownEditorLabels } from '../types';

const slashPluginKey = new PluginKey('slashCommand');

function slashItems(labels: MarkdownEditorLabels): SlashItem[] {
  return [
    { id: 'heading2', label: labels.heading2, command: 'heading2' },
    { id: 'heading3', label: labels.heading3, command: 'heading3' },
    { id: 'bulletList', label: labels.bulletList, command: 'bulletList' },
    { id: 'orderedList', label: labels.orderedList, command: 'orderedList' },
    { id: 'quote', label: labels.quote, command: 'blockquote' },
    { id: 'note', label: labels.note, command: 'note' },
    { id: 'warning', label: labels.warning, command: 'warning' },
    { id: 'codeBlock', label: labels.codeBlock, command: 'codeBlock' },
    { id: 'image', label: labels.image, command: 'image' },
    { id: 'table', label: labels.table, command: 'table' },
    { id: 'divider', label: labels.divider, command: 'divider' },
  ];
}

function runSlashCommand(
  editor: Parameters<NonNullable<SuggestionOptions['command']>>[0]['editor'],
  id: string,
) {
  const chain = editor.chain().focus().deleteRange;
  switch (id) {
    case 'heading2':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    case 'heading3':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run();
      return;
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run();
      return;
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run();
      return;
    case 'note':
      editor.chain().focus().setCallout('NOTE').run();
      return;
    case 'warning':
      editor.chain().focus().setCallout('WARNING').run();
      return;
    case 'codeBlock':
      editor.chain().focus().toggleCodeBlock().run();
      return;
    case 'image':
      editor.chain().focus().insertContent('![|](/api/public/media/)').run();
      return;
    case 'table':
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      return;
    case 'divider':
      editor.chain().focus().setHorizontalRule().run();
      return;
    default:
      void chain;
  }
}

export const SlashCommand = Extension.create<{ labels: MarkdownEditorLabels }>({
  name: 'slashCommand',
  addOptions() {
    return {
      labels: {
        placeholder: '',
        write: '',
        split: '',
        preview: '',
        markdown: '',
        words: '',
        undo: '',
        redo: '',
        paragraph: '',
        heading2: 'Heading 2',
        heading3: 'Heading 3',
        bold: '',
        italic: '',
        strike: '',
        inlineCode: '',
        link: '',
        linkUrl: '',
        linkApply: '',
        linkRemove: '',
        bulletList: 'Bullet list',
        orderedList: 'Ordered list',
        quote: 'Quote',
        note: 'Note',
        warning: 'Warning',
        codeBlock: 'Code block',
        image: 'Image',
        imageUrl: '',
        imageAlt: '',
        imageApply: '',
        table: 'Table',
        tableInsert: '',
        tableAddRow: '',
        tableAddColumn: '',
        tableDeleteRow: '',
        tableDeleteColumn: '',
        tableDelete: '',
        divider: 'Divider',
        more: '',
        plainText: '',
        slashEmpty: 'No matches',
        shortcuts: {
          undo: '',
          redo: '',
          paragraph: '',
          heading2: '',
          heading3: '',
          bold: '',
          italic: '',
          strike: '',
          inlineCode: '',
          link: '',
          bulletList: '',
          orderedList: '',
          quote: '',
          codeBlock: '',
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        char: '/',
        pluginKey: slashPluginKey,
        allow: ({ editor }) => editor.isEditable,
        items: ({ query }) => {
          const items = slashItems(this.options.labels);
          const needle = query.toLowerCase();
          return items.filter((item) => item.label.toLowerCase().includes(needle));
        },
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          runSlashCommand(editor, props.command);
        },
        render: () => {
          let component: ReactRenderer | undefined;
          let unmount: (() => void) | undefined;
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, {
                editor: props.editor,
                props: {
                  items: props.items,
                  command: props.command,
                  empty: this.options.labels.slashEmpty,
                },
              });
              unmount = props.mount(component.element);
            },
            onUpdate: (props) => {
              component?.updateProps({
                items: props.items,
                command: props.command,
                empty: this.options.labels.slashEmpty,
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                unmount?.();
                return true;
              }
              return false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
