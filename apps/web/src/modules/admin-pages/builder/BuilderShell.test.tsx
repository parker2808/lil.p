import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BLOCK_REGISTRY } from '@portfolio/contracts';

import viMessages from '../../../../i18n/locales/vi.json';
import { BLOCK_EDITOR_META } from '../constants/block-editor-meta.constant';
import { BuilderShell } from './BuilderShell';
import { reduceBuilderCommand, type BuilderState } from './canvas/commands';

const localeState = vi.hoisted(() => ({ current: 'en' }));
vi.mock('next-intl', async () => {
  const [{ default: english }, { default: vietnamese }] = await Promise.all([
    import('../../../../i18n/locales/en.json'),
    import('../../../../i18n/locales/vi.json'),
  ]);
  return {
    useLocale: () => localeState.current,
    useTranslations: () => (key: string) => {
      const names =
        localeState.current === 'vi' ? vietnamese.admin.pages.types : english.admin.pages.types;
      return names[key.split('.').at(-1) as keyof typeof names] ?? key;
    },
  };
});

const state: BuilderState = {
  document: {
    schemaVersion: 1,
    root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
  },
  selectedId: 'page',
};

afterEach(() => {
  cleanup();
  localeState.current = 'en';
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  window.dispatchEvent(new Event('resize'));
});

it('finds every host tile by its Vietnamese display name', () => {
  localeState.current = 'vi';
  render(
    <BuilderShell
      pageKey="home"
      state={state}
      onDispatch={(command) => reduceBuilderCommand(state, command)}
    />,
  );
  const palette = screen.getByRole('complementary', { name: 'Thành phần' });
  for (const type of Object.keys(BLOCK_REGISTRY) as (keyof typeof BLOCK_REGISTRY)[]) {
    const labelKey = BLOCK_EDITOR_META[type].labelKey
      .split('.')
      .at(-1) as keyof typeof viMessages.admin.pages.types;
    const localized = viMessages.admin.pages.types[labelKey];
    fireEvent.change(within(palette).getByRole('textbox', { name: 'Tìm thành phần' }), {
      target: { value: localized },
    });
    expect(
      within(palette).getByRole('button', { name: (name) => name.startsWith(localized) }),
    ).toBeVisible();
  }
});

it('uses localized host labels in the canvas, layers and selection announcement', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  const hostState: BuilderState = {
    document: {
      schemaVersion: 1,
      root: {
        id: 'page',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'section',
            type: 'section',
            responsive: { base: {} },
            content: [
              {
                id: 'hero',
                type: 'component',
                componentType: 'hero',
                responsive: { base: {} },
              },
            ],
          },
        ],
      },
    },
    selectedId: 'hero',
  };
  render(
    <BuilderShell
      pageKey="home"
      state={hostState}
      onDispatch={(command) => reduceBuilderCommand(hostState, command)}
      componentLabels={{ hero: 'Đầu trang' }}
      renderProperties={() => null}
    />,
  );
  fireEvent(window, new Event('resize'));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Đầu trang' })).toBeInTheDocument(),
  );
  expect(screen.getByRole('button', { name: 'Select Đầu trang' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Select Đầu trang' }));
  expect(screen.getByRole('status')).toHaveTextContent('Selected: Đầu trang');
});

it('mounts Properties once in desktop inspector or mobile/tablet sheet and restores focus', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  const renderProperties = vi.fn(() => <span data-testid="host-properties" />);
  render(
    <BuilderShell
      pageKey="home"
      state={state}
      onDispatch={(command) => reduceBuilderCommand(state, command)}
      renderProperties={renderProperties}
    />,
  );
  expect(screen.getAllByTestId('host-properties')).toHaveLength(1);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1100 });
  fireEvent(window, new Event('resize'));
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 768 });
  fireEvent(window, new Event('resize'));
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
  const tabletTrigger = within(screen.getByRole('navigation', { name: 'Page builder' })).getByRole(
    'button',
    { name: 'Properties' },
  );
  fireEvent.click(tabletTrigger);
  const tabletSheet = screen.getByRole('dialog', { name: 'Properties' });
  expect(within(tabletSheet).getByTestId('host-properties')).toBeInTheDocument();
  expect(screen.getAllByTestId('host-properties')).toHaveLength(1);
  fireEvent.keyDown(tabletSheet, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1101 });
  fireEvent(window, new Event('resize'));
  await waitFor(() => expect(screen.getAllByTestId('host-properties')).toHaveLength(1));
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  fireEvent(window, new Event('resize'));
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Page builder' })).getByRole('button', {
      name: 'Properties',
    }),
  );
  await waitFor(() => expect(screen.getAllByTestId('host-properties')).toHaveLength(1));
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Properties' }), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
});

it('traps focus across Properties textarea and select, then restores the sheet trigger', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  render(
    <BuilderShell
      pageKey="home"
      state={state}
      onDispatch={(command) => reduceBuilderCommand(state, command)}
      status="Draft saved"
      renderProperties={() => (
        <div>
          <textarea aria-label="Text" />
          <select aria-label="Heading level">
            <option>2</option>
          </select>
        </div>
      )}
    />,
  );
  const trigger = within(screen.getByRole('navigation', { name: 'Page builder' })).getByRole(
    'button',
    { name: 'Properties' },
  );
  fireEvent.click(trigger);
  const dialog = await screen.findByRole('dialog', { name: 'Properties' });
  expect(within(dialog).getByRole('status')).toHaveTextContent('Draft saved');
  const close = within(dialog).getByRole('button', { name: 'Cancel' });
  const textarea = within(dialog).getByRole('textbox', { name: 'Text' });
  const select = within(dialog).getByRole('combobox', { name: 'Heading level' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(select).toHaveFocus();
  textarea.focus();
  expect(fireEvent.keyDown(textarea, { key: 'Tab' })).toBe(true);
  select.focus();
  fireEvent.keyDown(select, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('dismisses an open tablet Properties sheet on desktop transition without losing focus', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 768 });
  const { container } = render(
    <BuilderShell
      pageKey="home"
      state={state}
      onDispatch={(command) => reduceBuilderCommand(state, command)}
      renderProperties={() => <input aria-label="Selected item ID" value="page" readOnly />}
    />,
  );
  const shell = within(container);
  const trigger = within(shell.getByRole('navigation', { name: 'Page builder' })).getByRole(
    'button',
    { name: 'Properties' },
  );
  fireEvent.click(trigger);
  expect(shell.getByRole('dialog', { name: 'Properties' })).toContainElement(
    shell.getByRole('textbox', { name: 'Selected item ID' }),
  );
  for (const width of [1100, 1440, 768, 1101, 768]) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    fireEvent(window, new Event('resize'));
    if (width > 1100) {
      await waitFor(() => expect(shell.queryByRole('dialog', { name: 'Properties' })).toBeNull());
      expect(shell.getAllByRole('textbox', { name: 'Selected item ID' })).toHaveLength(1);
      await waitFor(() =>
        expect(shell.getByRole('complementary', { name: 'Properties' })).toHaveFocus(),
      );
    } else {
      expect(shell.queryByRole('complementary', { name: 'Properties' })).toBeNull();
      if (width === 768) {
        await waitFor(() => expect(trigger).toHaveFocus());
        fireEvent.click(trigger);
        const sheet = shell.getByRole('dialog', { name: 'Properties' });
        expect(within(sheet).getAllByRole('textbox', { name: 'Selected item ID' })).toHaveLength(1);
        fireEvent.keyDown(sheet, { key: 'Escape' });
        await waitFor(() => expect(trigger).toHaveFocus());
        fireEvent.click(trigger);
      }
    }
  }
});
