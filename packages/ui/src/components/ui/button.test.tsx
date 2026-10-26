import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('marks loading as busy and keeps the label for width', () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('slots onto a single child without wrapping it', () => {
    render(
      <Button asChild>
        <a href="/projects">Work</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/projects');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
