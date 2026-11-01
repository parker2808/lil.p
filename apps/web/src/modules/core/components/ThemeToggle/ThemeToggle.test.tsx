import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';

const setTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme,
  }),
}));

import { ThemeToggle } from './ThemeToggle';

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ThemeToggle />
    </NextIntlClientProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it('opens a menu with light, dark and system options', async () => {
    const user = userEvent.setup();
    renderToggle();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Theme' }));

    expect(await screen.findByRole('menuitemradio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeInTheDocument();
    const system = screen.getByRole('menuitemradio', { name: 'System' });
    expect(system).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
