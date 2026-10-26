import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('exposes the series as an image with a label', () => {
    render(<Sparkline values={[1, 3, 2]} label="Views" />);
    expect(screen.getByRole('img', { name: 'Views' })).toBeInTheDocument();
  });
});
