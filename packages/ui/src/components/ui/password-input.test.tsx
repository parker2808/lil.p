import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('toggles the input type with an aria-pressed eye button', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    const input = screen.getByLabelText('Password');
    expect(input.getAttribute('type')).toBe('password');

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);

    expect(input.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps autocomplete and other input props', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" autoComplete="current-password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');

    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);
    expect(input).toHaveAttribute('autocomplete', 'current-password');
  });
});
