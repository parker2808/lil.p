import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { CalloutView } from '../components/CalloutView/CalloutView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (kind: 'NOTE' | 'WARNING') => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addOptions() {
    return {
      note: 'Note',
      warning: 'Warning',
    };
  },
  addAttributes() {
    return {
      kind: {
        default: 'NOTE',
        parseHTML: (element) => {
          const kind = element.getAttribute('data-kind');
          return kind === 'WARNING' ? 'WARNING' : 'NOTE';
        },
        renderHTML: (attributes) => ({ 'data-kind': attributes.kind }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'aside[data-kind]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes({ 'data-slot': 'callout' }, HTMLAttributes), 0];
  },
  markdownTokenName: 'callout',
  markdownTokenizer: {
    name: 'callout',
    level: 'block',
    start: (src) => {
      const index = src.search(/(^|\n)> \[!(NOTE|WARNING)\]/);
      return index < 0 ? -1 : src.startsWith('> [!') ? 0 : index + 1;
    },
    tokenize(src, _tokens, lexer) {
      const match = src.match(/^> \[!(NOTE|WARNING)\][ \t]*(?:\n((?:>[^\n]*(?:\n|$))*))?/);
      if (!match) {
        return;
      }
      const body = (match[2] ?? '').replace(/^> ?/gm, '').replace(/\n$/, '');
      return {
        type: 'callout',
        raw: match[0],
        kind: match[1],
        tokens: lexer.blockTokens(body),
      };
    },
  },
  parseMarkdown(token, helpers) {
    const kind = token.kind === 'WARNING' ? 'WARNING' : 'NOTE';
    const content = token.tokens?.length
      ? helpers.parseChildren(token.tokens)
      : [helpers.createNode('paragraph')];
    return helpers.createNode(this.name, { kind }, content);
  },
  renderMarkdown(node, helpers) {
    const kind = node.attrs?.kind === 'WARNING' ? 'WARNING' : 'NOTE';
    const inner = helpers.renderChildren(node.content ?? []).replace(/\n$/, '');
    const quoted = inner
      .split('\n')
      .map((line) => (line.length > 0 ? `> ${line}` : '>'))
      .join('\n');
    return `> [!${kind}]\n${quoted}`;
  },
  addCommands() {
    return {
      setCallout:
        (kind) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { kind },
            content: [{ type: 'paragraph' }],
          }),
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});
