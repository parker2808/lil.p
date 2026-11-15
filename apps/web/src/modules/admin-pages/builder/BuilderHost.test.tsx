import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BuilderHost } from './BuilderHost';
import {
  activateBuilderDraft,
  readActiveBuilderDraft,
  readBuilderDraft,
  saveBuilderDraft,
  publishBuilderDraft,
  restoreBuilderVersion,
} from './autosave/transport';
import { listAdminPageVersions } from '../services/admin-pages.service';

const localeState = vi.hoisted(() => ({ current: 'en' as 'en' | 'vi' }));
vi.mock('next-intl', () => ({
  useLocale: () => localeState.current,
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/modules/admin-core/hooks/use-me.hook', () => ({
  useMe: () => ({ id: 10, role: 'admin' }),
}));
vi.mock('./autosave/transport', () => ({
  readBuilderDraft: vi.fn(),
  readActiveBuilderDraft: vi.fn(),
  activateBuilderDraft: vi.fn(),
  saveBuilderDraft: vi.fn(),
  publishBuilderDraft: vi.fn(),
  restoreBuilderVersion: vi.fn(),
}));
vi.mock('../services/admin-pages.service', () => ({ listAdminPageVersions: vi.fn() }));

const empty = {
  schemaVersion: 1 as const,
  root: { id: 'page', type: 'page' as const, responsive: { base: {} }, sections: [] },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  localeState.current = 'en';
});

it('publishes only the acknowledged tree revision and refreshes it before further editing', async () => {
  vi.mocked(readBuilderDraft)
    .mockResolvedValueOnce({ mode: 'tree', revision: '8', tree: empty })
    .mockResolvedValueOnce({ mode: 'tree', revision: '8', tree: empty })
    .mockResolvedValueOnce({ mode: 'tree', revision: '9', tree: empty });
  vi.mocked(publishBuilderDraft).mockResolvedValue({} as never);
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  await waitFor(() => expect(publishBuilderDraft).toHaveBeenCalledWith('ideas', '8'));
  await screen.findByText('Published · draft is ready for further edits');
  expect(readBuilderDraft).toHaveBeenCalledTimes(3);
});

it('confirms restore against the saved revision and resets history only after server success', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(listAdminPageVersions).mockResolvedValue([
    { version: 2, createdAt: '2026-11-15T00:00:00Z', authorName: null, note: null, blockCount: 1 },
  ]);
  let completeRestore: (value: {
    mode: 'tree';
    revision: string;
    tree: typeof empty;
  }) => void = () => undefined;
  vi.mocked(restoreBuilderVersion).mockImplementation(
    () =>
      new Promise((resolve) => {
        completeRestore = resolve;
      }),
  );
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Version history' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Restore draft 2' }));
  expect(screen.getByRole('alertdialog')).toBeVisible();
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Restore draft' }),
  );
  await waitFor(() => expect(restoreBuilderVersion).toHaveBeenCalledWith('ideas', 2, '8'));
  expect(screen.getByRole('alertdialog')).toBeVisible();
  completeRestore({ mode: 'tree', revision: '9', tree: empty });
  await screen.findByText('Version restored to draft · publish separately to make it public');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
});

it('blocks version mutations on a stale server draft without dropping local content', async () => {
  vi.mocked(readBuilderDraft)
    .mockResolvedValueOnce({ mode: 'tree', revision: '8', tree: empty })
    .mockResolvedValueOnce({ mode: 'tree', revision: '9', tree: empty });
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  await screen.findByText('Version action uncertain · check the server draft before editing again');
  expect(publishBuilderDraft).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
});

it('does not allow editing after a successful publish with an unadvanced server revision', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(publishBuilderDraft).mockResolvedValue({} as never);
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  await screen.findByText('Published · draft reload is required before further edits');
  expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
});

it('keeps the confirmation open and hides raw API errors on a failed restore', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(listAdminPageVersions).mockResolvedValue([
    { version: 1, createdAt: '2026-11-15T00:00:00Z', authorName: null, note: null, blockCount: 1 },
  ]);
  vi.mocked(restoreBuilderVersion).mockRejectedValue({ status: 409, message: 'Raw server error' });
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Version history' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Restore draft 1' }));
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Restore draft' }),
  );
  const dialog = screen.getByRole('alertdialog');
  expect(await within(dialog).findByRole('alert')).toHaveTextContent(
    'Server draft changed · reload before trying again',
  );
  expect(dialog).toBeVisible();
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
  expect(screen.queryByText('Raw server error')).toBeNull();
  expect(screen.getByText('Publish').closest('button')).toBeDisabled();
});

it('announces a localized restore failure inside the active VI confirmation', async () => {
  localeState.current = 'vi';
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'tree', revision: '8', tree: empty });
  vi.mocked(listAdminPageVersions).mockResolvedValue([
    { version: 1, createdAt: '2026-11-15T00:00:00Z', authorName: null, note: null, blockCount: 1 },
  ]);
  vi.mocked(restoreBuilderVersion).mockRejectedValue({ status: 409, message: 'Raw server error' });
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Đã lưu bản nháp');
  fireEvent.click(screen.getByRole('button', { name: 'Lịch sử phiên bản' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Khôi phục bản nháp 1' }));
  const dialog = screen.getByRole('alertdialog');
  const confirm = within(dialog).getByRole('button', { name: 'Khôi phục bản nháp' });
  fireEvent.click(confirm);
  expect(await within(dialog).findByRole('alert')).toHaveTextContent(
    'Bản nháp máy chủ đã thay đổi · tải lại trước khi thử lại',
  );
  expect(within(dialog).getByRole('button', { name: 'Hủy' })).toHaveFocus();
  expect(screen.queryByText('Raw server error')).toBeNull();
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

it('reconciles edits made during activation before clearing recovery', async () => {
  vi.mocked(readBuilderDraft).mockResolvedValue({ mode: 'legacy', revision: '8', tree: null });
  let finishActivation!: (draft: { tree: typeof empty; revision: string }) => void;
  vi.mocked(activateBuilderDraft).mockReturnValue(
    new Promise((resolve) => {
      finishActivation = resolve;
    }),
  );
  let finishSave!: (draft: { tree: typeof empty; revision: string }) => void;
  vi.mocked(saveBuilderDraft).mockImplementation(
    () =>
      new Promise((resolve) => {
        finishSave = resolve;
      }),
  );
  render(<BuilderHost pageKey="ideas" />);
  await screen.findByText('Local study · activate to save');
  const palette = screen.getByRole('complementary', { name: 'Components' });
  fireEvent.click(within(palette).getByRole('button', { name: 'Section' }));
  fireEvent.click(screen.getByRole('button', { name: 'Activate tree draft' }));
  await waitFor(() => expect(activateBuilderDraft).toHaveBeenCalledTimes(1));
  const submitted = vi.mocked(activateBuilderDraft).mock.calls[0]![1];
  fireEvent.click(within(palette).getByRole('button', { name: 'Heading' }));
  finishActivation({ tree: submitted as typeof empty, revision: '9' });
  await waitFor(
    () => expect(saveBuilderDraft).toHaveBeenCalledWith('ideas', expect.anything(), '9'),
    {
      timeout: 2500,
    },
  );
  const savedTree = vi.mocked(saveBuilderDraft).mock.calls[0]![1];
  expect(JSON.stringify(savedTree)).toContain('heading');
  expect(JSON.stringify(submitted)).not.toContain('heading');
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('heading');
  finishSave({ tree: savedTree as typeof empty, revision: '10' });
  await screen.findByText('Draft saved');
});

it('offers stored recovery after a failed remote read without overwriting it on edit', async () => {
  vi.mocked(readBuilderDraft).mockRejectedValue(new Error('Network unavailable'));
  const stored = JSON.stringify({ at: Date.now(), tree: empty });
  localStorage.setItem('cms-builder-recovery:10:ideas', stored);
  render(<BuilderHost pageKey="ideas" />);
  const recovery = await screen.findByRole('region', { name: 'Restore local edits' });
  fireEvent.click(
    within(screen.getByRole('complementary', { name: 'Components' })).getByRole('button', {
      name: 'Section',
    }),
  );
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toBe(stored);
  expect(recovery).toBeVisible();
  fireEvent.click(within(recovery).getByRole('button', { name: 'Dismiss recovery' }));
  expect(localStorage.getItem('cms-builder-recovery:10:ideas')).toContain('sections');
  expect(document.querySelectorAll('[data-node-type="section"]')).toHaveLength(1);
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
