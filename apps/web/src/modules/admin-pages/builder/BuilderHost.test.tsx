import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BuilderHost } from './BuilderHost';
import { readActiveBuilderDraft, readBuilderDraft, saveBuilderDraft } from './autosave/transport';

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

it('keeps local edits when a concurrent restore removes the server tree', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(saveBuilderDraft).mockRejectedValue({ status: 409 });
  vi.mocked(readActiveBuilderDraft).mockResolvedValue({ revision: '9', tree: null });
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(
    within(screen.getByRole('complementary', { name: 'Components' })).getByRole('button', {
      name: 'Section',
    }),
  );
  await screen.findByText('Conflict · your edits are kept locally');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findAllByText('Server draft was restored · your edits are kept locally');
  const review = screen.getByRole('region', { name: 'Review changes' });
  expect(
    within(review).getByRole('button', { name: 'Discard local edits and reload server draft' }),
  ).toBeDisabled();
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('sections');
});

it('restores a dirty edit after unmount before the debounce can save it', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  const first = render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(
    within(screen.getByRole('complementary', { name: 'Components' })).getByRole('button', {
      name: 'Section',
    }),
  );
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('sections');
  first.unmount();
  render(<BuilderHost pageKey="ideas" />);
  const recovery = await screen.findByRole('region', { name: 'Restore local edits' });
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(0);
  fireEvent.click(within(recovery).getByRole('button', { name: 'Restore local edits' }));
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('sections');
});

it('warns before reload and offers export if local recovery cannot be stored', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });
  try {
    render(<BuilderHost pageKey="ideas" />);
    await screen.findByText('Draft saved');
    fireEvent.click(
      within(screen.getByRole('complementary', { name: 'Components' })).getByRole('button', {
        name: 'Section',
      }),
    );
    const warning = screen.getByRole('alert');
    expect(within(warning).getByText(/Local recovery is unavailable/)).toBeVisible();
    expect(within(warning).getByRole('button', { name: 'Export local draft' })).toBeVisible();
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  } finally {
    storage.mockRestore();
  }
});
