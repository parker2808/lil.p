import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AccentHeadline } from './AccentHeadline';

describe('AccentHeadline', () => {
  it('wraps the accent substring in primary text', () => {
    render(<AccentHeadline text="Hello world" accent="world" />);
    expect(screen.getByText('world')).toHaveClass('text-primary');
  });

  it('renders a plain heading when the accent is missing', () => {
    const { container } = render(<AccentHeadline text="Plain title" accent="nope" />);
    expect(container.querySelector('.text-primary')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Plain title' })).toBeInTheDocument();
  });
});
