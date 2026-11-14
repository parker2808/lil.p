import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';

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
    expect(screen.queryByRole('option', { name: /Page header/i })).not.toBeInTheDocument();
    await userEvent.click(hero);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it.each([
    ['en', en, ['Page header', 'Prose', 'CTA band']],
    ['vi', viMessages, ['Tiêu đề trang', 'Văn bản', 'Dải kêu gọi hành động']],
  ] as const)(
    'offers exactly the shared custom-page types in %s',
    async (locale, messages, names) => {
      const onAdd = vi.fn();
      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AddBlockDialog pageKey="ideas" counts={{}} readOnly={false} onAdd={onAdd} />
        </NextIntlClientProvider>,
      );
      await userEvent.click(screen.getByRole('button', { name: messages.admin.pages.add }));
      expect(await screen.findAllByRole('option')).toHaveLength(3);
      for (const name of names) {
        expect(screen.getByRole('option', { name: new RegExp(name, 'i') })).toBeVisible();
      }
    },
  );
});
