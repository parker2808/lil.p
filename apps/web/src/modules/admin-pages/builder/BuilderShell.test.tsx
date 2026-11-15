import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  window.dispatchEvent(new Event('resize'));
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
