import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FormField } from './form-field';
import { Input } from './input';
import { Textarea } from './textarea';

describe('FormField', () => {
  it('shows a required mark and marks the control required', () => {
    render(
      <FormField label="Name" required>
        <Input />
      </FormField>,
    );

    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
  });

  it('links an inline error to the control while preserving its existing description', () => {
    render(
      <FormField label="Name" error="Enter a name">
        <Input aria-describedby="name-hint" />
      </FormField>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Enter a name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(['name-hint', error.id]);
  });

  it('shows and updates a counter for maxLength', async () => {
    const user = userEvent.setup();
    render(
      <FormField label="Bio" maxLength={5}>
        <Textarea defaultValue="Hi" />
      </FormField>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    const counter = screen.getByText('2 / 5');
    expect(textarea).toHaveAttribute('maxLength', '5');
    await user.type(textarea, 'abc');
    expect(counter).toHaveTextContent('5 / 5');
  });
});
