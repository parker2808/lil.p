import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';

describe('shared choices', () => {
  it('keeps a selected radio checked and changes only on another choice', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Layout" defaultValue="one">
        <RadioGroupItem value="one">One</RadioGroupItem>
        <RadioGroupItem value="two">Two</RadioGroupItem>
      </RadioGroup>,
    );
    const first = screen.getByRole('radio', { name: 'One' });
    expect(first).toBeChecked();
    await user.click(first);
    expect(first).toBeChecked();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked());
  });

  it('does not select an empty group on Tab or programmatic focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <button>Before</button>
        <RadioGroup aria-label="Layout" onValueChange={onValueChange}>
          <RadioGroupItem value="one">One</RadioGroupItem>
          <RadioGroupItem value="two">Two</RadioGroupItem>
        </RadioGroup>
      </>,
    );
    const first = screen.getByRole('radio', { name: 'One' });
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(first).toHaveFocus();
    expect(first).not.toBeChecked();
    screen.getByRole('radio', { name: 'Two' }).focus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenCalledWith('two');
  });

  it('preserves an existing selection on Tab entry and programmatic focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <button>Before</button>
        <RadioGroup aria-label="Layout" defaultValue="two" onValueChange={onValueChange}>
          <RadioGroupItem value="one">One</RadioGroupItem>
          <RadioGroupItem value="two">Two</RadioGroupItem>
        </RadioGroup>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Two' })).toHaveFocus();
    screen.getByRole('radio', { name: 'One' }).focus();
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('names and operates the select with the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select defaultValue="en" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="vi">Vietnamese</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Language' });
    await user.click(trigger);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('vi');
  });

  it('exposes checked, indeterminate, disabled and switch states', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox aria-label="Select all" checked="indeterminate" />
        <Checkbox aria-label="Unavailable" disabled />
        <Switch aria-label="Published" />
      </>,
    );
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'data-state',
      'indeterminate',
    );
    expect(screen.getByRole('checkbox', { name: 'Unavailable' })).toBeDisabled();
    const toggle = screen.getByRole('switch', { name: 'Published' });
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('opens a menu with an accessible item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Actions">Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Open</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitem', { name: 'Open' })).toBeVisible();
  });
});
