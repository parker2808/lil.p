import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';

import { AddBlockDialog } from './AddBlockDialog';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);
HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AddBlockDialog', () => {
  afterEach(() => {
    cleanup();
  });

  it('disables a type that is already at its limit', async () => {
    const onAdd = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AddBlockDialog pageKey="home" counts={{ hero: 1 }} readOnly={false} onAdd={onAdd} />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add block' }));
    const hero = await screen.findByRole('option', { name: /Hero/i });
    expect(hero).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(hero);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
