import { markdownKitchenSink, markdownUnsafe } from '@portfolio/contracts';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { describe, expect, it, vi } from 'vitest';

import { editorLabels } from './editor-labels.fixture';
import { createMarkdownExtensions } from './extensions/create-markdown-extensions';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownEditorGroup } from './MarkdownEditorGroup';

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

describe('MarkdownEditorGroup', () => {
  function renderGroup(renderPreview = vi.fn((markdown: string) => <p>{markdown}</p>)) {
    render(
      <MarkdownEditorGroup labels={editorLabels}>
        {['First body', 'Second body', 'Third body'].map((value) => (
          <MarkdownEditor
            key={value}
            value={value}
            onChange={() => undefined}
            labels={editorLabels}
            renderPreview={renderPreview}
          />
        ))}
      </MarkdownEditorGroup>,
    );
    return renderPreview;
  }

  it('renders one Write/Preview tablist for every editor in the group', async () => {
    renderGroup();
    await waitFor(() => {
      expect(document.querySelectorAll('.ProseMirror')).toHaveLength(3);
    });

    const tablists = screen.getAllByRole('tablist');
    expect(tablists).toHaveLength(1);
    expect(
      within(tablists[0]!)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual([editorLabels.write, editorLabels.preview]);
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="markdown-editor"]'),
    );
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(within(card).getAllByRole('toolbar').length).toBeGreaterThan(0);
    }
  });

  it('switches every editor to preview at once', async () => {
    const renderPreview = renderGroup();
    await waitFor(() => {
      expect(document.querySelectorAll('.ProseMirror')).toHaveLength(3);
    });

    await userEvent.click(screen.getByRole('tab', { name: editorLabels.preview }));

    expect(screen.getByRole('tab', { name: editorLabels.preview })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(document.querySelectorAll('.ProseMirror')).toHaveLength(0);
    expect(screen.queryAllByRole('toolbar')).toHaveLength(0);
    expect(await screen.findByText('Second body', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(renderPreview).toHaveBeenCalledTimes(3);

    await userEvent.click(screen.getByRole('tab', { name: editorLabels.write }));
    expect(document.querySelectorAll('.ProseMirror')).toHaveLength(3);
  });

  it('keeps standalone editors on their own tabs', async () => {
    render(<MarkdownEditor value="Body" onChange={() => undefined} labels={editorLabels} />);
    await waitFor(() => {
      expect(document.querySelector('.ProseMirror')).not.toBeNull();
    });
    expect(screen.getAllByRole('tablist')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: editorLabels.markdown })).toBeInTheDocument();
  });
});
