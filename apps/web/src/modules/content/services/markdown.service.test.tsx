import { markdownKitchenSink, markdownUnsafe } from '@portfolio/contracts';
import { editorLabels } from '@portfolio/ui/components/MarkdownEditor/editor-labels.fixture';
import { serializeMarkdown } from '@portfolio/ui/components/MarkdownEditor/extensions/create-markdown-extensions';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { renderMarkdown, type MarkdownLabels } from './markdown.service';

const labels: MarkdownLabels = {
  copy: 'Copy',
  copied: 'Copied',
  wrap: 'Wrap',
  note: 'Note',
  warning: 'Warning',
  anchor: 'Link to heading',
};

describe('renderMarkdown', () => {
  it('renders every kitchen-sink construct', async () => {
    const tree = await renderMarkdown(markdownKitchenSink, labels);
    const { container } = render(<>{tree}</>);

    expect(container.querySelector('#heading-two')).toHaveTextContent('Heading two');
    expect(container.querySelector('#heading-three')).toHaveTextContent('Heading three');
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('italic');
    expect(container.querySelector('del, s')).toBeTruthy();
    expect(container.querySelector('code')).toHaveTextContent('inline code');
    expect(screen.getByRole('link', { name: 'Safe link' })).toHaveAttribute(
      'href',
      '/notes/sample',
    );
    expect(container.querySelector('blockquote')).toHaveTextContent('A plain quote.');
    expect(container.querySelector('[data-kind="NOTE"]')).toHaveTextContent('A note callout.');
    expect(container.querySelector('[data-kind="WARNING"]')).toHaveTextContent(
      'A warning callout.',
    );
    expect(container.textContent).toContain('export const answer = 42;');
    expect(screen.getByText('ts')).toBeInTheDocument();
    expect(container.querySelector('hr')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Cover' })).toHaveAttribute(
      'src',
      '/api/public/media/cover.webp',
    );
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelector('br')).not.toBeNull();
  });

  it('drops script, iframe, javascript links and remote images', async () => {
    const tree = await renderMarkdown(markdownUnsafe, labels);
    const { container } = render(<>{tree}</>);

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.innerHTML).not.toContain('javascript:');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('h1')).toBeNull();
    expect(container.querySelector('#top-heading')?.tagName).toBe('H2');
    expect(screen.queryByRole('link', { name: 'Bad' })).toBeNull();
    expect(screen.getByText('Bad')).toBeInTheDocument();
  });

  it('renders kitchen-sink constructs after an editor round-trip', async () => {
    const markdown = serializeMarkdown(markdownKitchenSink, editorLabels);
    const tree = await renderMarkdown(markdown, labels);
    const { container } = render(<>{tree}</>);
    expect(container.querySelector('[data-kind="NOTE"]')).toBeTruthy();
    expect(container.querySelector('[data-kind="WARNING"]')).toBeTruthy();
    expect(container.textContent).toContain('export const answer = 42;');
    expect(container.querySelector('table')).not.toBeNull();
  });
});
