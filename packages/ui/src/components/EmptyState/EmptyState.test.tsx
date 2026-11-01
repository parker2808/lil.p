import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('renders the title, description and call to action', () => {
    render(
      <EmptyState
        glyph="¶"
        title="No notes yet"
        description="Nothing here yet"
        action={<a href="/projects">Read case studies</a>}
      />,
    );

    expect(screen.getByText('No notes yet')).toBeInTheDocument();
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read case studies' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  it('hides the decorative glyph from assistive technology', () => {
    const { container } = render(<EmptyState glyph="¶" title="No notes yet" />);

    const glyph = container.querySelector('.redesign-empty-state-glyph');
    expect(glyph).toHaveTextContent('¶');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders only the title when nothing else is given', () => {
    const { container } = render(<EmptyState title="Nothing here yet" />);

    expect(container.querySelectorAll('p')).toHaveLength(1);
    expect(container.querySelector('.redesign-empty-state-glyph')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
