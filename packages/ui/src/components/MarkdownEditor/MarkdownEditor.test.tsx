import { markdownKitchenSink, markdownUnsafe } from '@portfolio/contracts';
import { render, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { describe, expect, it, vi } from 'vitest';

import { editorLabels } from './editor-labels.fixture';
import { createMarkdownExtensions } from './extensions/create-markdown-extensions';
import { MarkdownEditor } from './MarkdownEditor';

function createHeadless(content: string) {
  return new Editor({
    extensions: createMarkdownExtensions({ labels: editorLabels }),
    content,
    contentType: 'markdown',
  });
}

describe('MarkdownEditor schema', () => {
  it('round-trips the kitchen-sink fixture', () => {
    const first = createHeadless(markdownKitchenSink);
    const once = first.getMarkdown();
    first.destroy();
    const second = createHeadless(once);
    const twice = second.getMarkdown();
    second.destroy();

    expect(twice).toBe(once);
    expect(once).toContain('## Heading two');
    expect(once).toContain('### Heading three');
    expect(once).toMatch(/\*\*bold\*\*/);
    expect(once).toMatch(/\*italic\*/);
    expect(once).toContain('`inline code`');
    expect(once).toContain('[Safe link](/notes/sample)');
    expect(once).toContain('> [!NOTE]');
    expect(once).toContain('> [!WARNING]');
    expect(once).toContain('```ts');
    expect(once).toContain('![Cover](/api/public/media/cover.webp)');
    expect(once).toContain('|');
  });

  it('strips unsafe constructs and demotes H1', () => {
    const editor = createHeadless(markdownUnsafe);
    const markdown = editor.getMarkdown();
    editor.destroy();

    expect(markdown).not.toMatch(/<script/i);
    expect(markdown).not.toMatch(/<iframe/i);
    expect(markdown).not.toMatch(/onerror/i);
    expect(markdown).not.toMatch(/javascript:/i);
    expect(markdown).not.toContain('https://evil.example');
    expect(markdown).not.toMatch(/^# /m);
    expect(markdown).toMatch(/^## /m);
  });

  it('round-trips callout kind and code-block language', () => {
    const source = '> [!WARNING]\n> Stay back.\n\n```sql\nSELECT 1;\n```';
    const editor = createHeadless(source);
    const markdown = editor.getMarkdown();
    editor.destroy();
    expect(markdown).toContain('> [!WARNING]');
    expect(markdown).toContain('```sql');
  });
});

describe('MarkdownEditor', () => {
  it('does not emit onChange when the document first opens', async () => {
    const onChange = vi.fn();
    render(
      <MarkdownEditor value={markdownKitchenSink} onChange={onChange} labels={editorLabels} />,
    );
    await waitFor(() => {
      expect(document.querySelector('.ProseMirror')).not.toBeNull();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the toolbar when read-only', async () => {
    const { container } = render(
      <MarkdownEditor
        value={markdownKitchenSink}
        onChange={() => undefined}
        labels={editorLabels}
        editable={false}
      />,
    );
    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull();
    });
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
    expect(container.querySelector('[aria-readonly="true"]')).not.toBeNull();
  });
});
