import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';

describe('Badge', () => {
  it('applies a hue token class', () => {
    render(<Badge hue="jade">Jade</Badge>);

    const badge = screen.getByText('Jade');
    expect(badge).toHaveAttribute('data-hue', 'jade');
    expect(badge.className).toContain('text-hue-jade');
    expect(badge.className).toContain('bg-hue-jade-subtle');
  });
});
