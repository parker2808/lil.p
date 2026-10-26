import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

function looksLikeMarkdown(text: string): boolean {
  return /^(#{1,3} |[-*] |\d+\. |> |```|\[.+\])|[*_~`]/.test(text);
}

export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('markdownPaste'),
        props: {
          handlePaste: (_view, event) => {
            if (!this.editor.isEditable) {
              return false;
            }
            const text = event.clipboardData?.getData('text/plain') ?? '';
            const html = event.clipboardData?.getData('text/html') ?? '';
            if (!text || html || !looksLikeMarkdown(text)) {
              return false;
            }
            return this.editor.commands.insertContent(text, { contentType: 'markdown' });
          },
        },
      }),
    ];
  },
});
