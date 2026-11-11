import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BuilderHost } from './BuilderHost';
import { readBuilderDraft, saveBuilderDraft } from './autosave/transport';

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));
vi.mock('@/modules/admin-core/hooks/use-me.hook', () => ({ useMe: () => ({ id: 10 }) }));
vi.mock('./autosave/transport', () => ({
  readBuilderDraft: vi.fn(),
  readActiveBuilderDraft: vi.fn(),
  activateBuilderDraft: vi.fn(),
  saveBuilderDraft: vi.fn(),
}));

const empty = {
  schemaVersion: 1 as const,
  root: { id: 'page', type: 'page' as const, responsive: { base: {} }, sections: [] },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

it('owns composition and undo/redo without saving local-only studies', async () => {
  render(<BuilderHost pageKey="home" />);
  const palette = screen.getByRole('complementary', { name: 'Components' });
  fireEvent.click(within(palette).getByRole('button', { name: 'Section' }));
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(0);
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
  expect(saveBuilderDraft).not.toHaveBeenCalled();
});

it('saves a validated edit against the acknowledged revision and keeps a conflict local', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(saveBuilderDraft).mockRejectedValue({ status: 409 });
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(
    within(screen.getByRole('complementary', { name: 'Components' })).getByRole('button', {
      name: 'Section',
    }),
  );
  await waitFor(
    () =>
      expect(saveBuilderDraft).toHaveBeenCalledWith(
        'ideas',
        expect.objectContaining({ root: expect.objectContaining({ sections: expect.any(Array) }) }),
        '8',
      ),
    { timeout: 2500 },
  );
  await screen.findByText('Conflict · your edits are kept locally');
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('sections');
});
