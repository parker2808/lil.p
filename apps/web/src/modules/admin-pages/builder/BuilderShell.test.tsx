import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BuilderShell } from './BuilderShell';
import { reduceBuilderCommand, type BuilderState } from './canvas/commands';

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));

const state: BuilderState = {
  document: {
    schemaVersion: 1,
    root: { id: 'page', type: 'page', responsive: { base: {} }, sections: [] },
  },
  selectedId: 'page',
};

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  window.dispatchEvent(new Event('resize'));
});

it('mounts the host Properties editor exactly once across desktop and mobile sheet transitions', async () => {
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
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 768 });
  fireEvent(window, new Event('resize'));
  await waitFor(() => expect(screen.queryByTestId('host-properties')).toBeNull());
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Page builder' })).getByRole('button', {
      name: 'Properties',
    }),
  );
  await waitFor(() => expect(screen.getAllByTestId('host-properties')).toHaveLength(1));
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Properties' }), { key: 'Escape' });
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
