import {
  isAllowedImageSrc,
  isAllowedMarkdownUrl,
  MARKDOWN_CODE_LANGUAGES,
} from '@portfolio/contracts';
import { Editor } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createElement } from 'react';

import { CodeBlockView } from '../components/CodeBlockView/CodeBlockView';
import type { MarkdownEditorLabels } from '../types';
import { Callout } from './callout.extension';
import { createEditorLowlight } from './create-lowlight';
import { ClampedHeading } from './heading-clamp.extension';
import { MarkdownPaste } from './markdown-paste.extension';
import { SafeLink } from './safe-content.extension';
import { SlashCommand } from './slash-command.extension';

const lowlight = createEditorLowlight();

const SafeImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          const src = element.getAttribute('src');
          return src && isAllowedImageSrc(src) ? src : null;
        },
      },
      alt: {
        default: '',
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }
          const src = element.getAttribute('src');
          if (!src || !isAllowedImageSrc(src)) {
            return false;
          }
          return { src, alt: element.getAttribute('alt') ?? '' };
        },
      },
    ];
  },
  parseMarkdown(token, helpers) {
    const src = String(token.href ?? token.src ?? '');
    if (!isAllowedImageSrc(src)) {
      return [];
    }
    return helpers.createNode(this.name, { src, alt: String(token.text ?? token.alt ?? '') });
  },
});

export function createMarkdownExtensions(options: {
  labels: MarkdownEditorLabels;
  placeholder?: string;
}) {
  const { labels, placeholder = labels.placeholder } = options;

  return [
    StarterKit.configure({
      heading: false,
      underline: false,
      codeBlock: false,
      link: false,
    }),
    ClampedHeading.configure({ levels: [2, 3] }),
    SafeLink.configure({
      openOnClick: false,
      autolink: true,
      isAllowedUri: (url) => Boolean(url && isAllowedMarkdownUrl(url)),
    }),
    Markdown,
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer((props) =>
          createElement(CodeBlockView, { ...props, plainText: labels.plainText }),
        );
      },
    }).configure({
      lowlight,
      defaultLanguage: 'ts',
    }),
    SafeImage.configure({ allowBase64: false }),
    TableKit,
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
    }),
    CharacterCount,
    Callout.configure({ note: labels.note, warning: labels.warning }),
    SlashCommand.configure({ labels }),
    MarkdownPaste,
  ];
}

export const markdownCodeLanguages = ['', ...MARKDOWN_CODE_LANGUAGES] as const;

export function serializeMarkdown(source: string, labels: MarkdownEditorLabels): string {
  const editor = new Editor({
    extensions: createMarkdownExtensions({ labels }),
    content: source,
    contentType: 'markdown',
  });
  const markdown = editor.getMarkdown();
  editor.destroy();
  return markdown;
}
