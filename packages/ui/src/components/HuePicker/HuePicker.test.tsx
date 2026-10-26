import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HuePicker } from './HuePicker';

const labels = {
  JADE: 'Jade',
  AMBER: 'Amber',
  BLUE: 'Blue',
  VIOLET: 'Violet',
  ROSE: 'Rose',
};

describe('HuePicker', () => {
  it('shows a pill for each hue', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HuePicker value="JADE" onChange={onChange} labels={labels} />);

    expect(screen.getByRole('radio', { name: 'Jade' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Amber' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Violet' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Rose' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Amber' }));
    expect(onChange).toHaveBeenCalledWith('AMBER');
  });
});
