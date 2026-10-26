import { ICON_KEYS } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconPicker } from './IconPicker';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
HTMLElement.prototype.scrollIntoView = vi.fn();

describe('IconPicker', () => {
  it('offers only allowlisted icons', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IconPicker
        value=""
        onChange={onChange}
        labels={{ open: 'Choose icon', search: 'Search icons', empty: 'No icons' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Choose icon' }));
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(ICON_KEYS.length);
    expect(screen.queryByText('not-an-icon')).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /sparkles/i }));
    expect(onChange).toHaveBeenCalledWith('sparkles');
  });
});
