import { beforeEach, describe, expect, it, vi } from 'vitest';

const showToast = vi.fn();
vi.mock('sonner', () => ({ toast: (...args: unknown[]) => showToast(...args) }));

import { toastUndo } from './toast-undo.util';

describe('toastUndo', () => {
  beforeEach(() => showToast.mockReset());

  it('shows an undo action for five seconds', () => {
    const onUndo = vi.fn();
    toastUndo('Archived', onUndo);
    expect(showToast).toHaveBeenCalledWith('Archived', {
      duration: 5000,
      action: { label: 'Undo', onClick: onUndo },
    });
    const options = showToast.mock.calls[0]?.[1];
    options.action.onClick();
    expect(onUndo).toHaveBeenCalledOnce();
  });
});
