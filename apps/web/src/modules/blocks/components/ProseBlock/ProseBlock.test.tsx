import { markdownUnsafe } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

import { renderMarkdown } from '@/modules/content/services/markdown.service';

const labels = {
  copy: 'Copy',
  copied: 'Copied',
  wrap: 'Wrap',
  note: 'Note',
  warning: 'Warning',
  anchor: 'Link to heading',
};

describe('prose unsafe fixture', () => {
  it('renders none of the unsafe items', async () => {
    const tree = await renderMarkdown(markdownUnsafe, labels);
    const { container } = render(<>{tree}</>);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.innerHTML).not.toContain('javascript:');
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Bad' })).toBeNull();
  });
});
