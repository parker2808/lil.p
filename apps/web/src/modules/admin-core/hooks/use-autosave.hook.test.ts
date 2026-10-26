import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/modules/core/utils/api-error.util';

import { useAutosave } from './use-autosave.hook';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not PATCH when the value matches the editor baseline', async () => {
    const save = vi.fn();
    renderHook(() =>
      useAutosave({
        value: '## Hello',
        baseline: '## Hello',
        updatedAt: '2026-01-01T00:00:00.000Z',
        enabled: true,
        storageKey: 'editor:test:en',
        save,
      }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('saves 1.5s after the value diverges from the baseline', async () => {
    const save = vi.fn().mockResolvedValue({ updatedAt: '2026-01-01T00:00:01.000Z' });
    const { rerender } = renderHook(
      (value: string) =>
        useAutosave({
          value,
          baseline: '## Hello',
          updatedAt: '2026-01-01T00:00:00.000Z',
          enabled: true,
          storageKey: 'editor:test:en',
          save,
        }),
      { initialProps: '## Hello' },
    );

    rerender('## Hello world');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1499);
    });
    expect(save).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('enters conflict when the save returns 409', async () => {
    const save = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 409, code: 'STALE', message: 'stale' }));
    const { result, rerender } = renderHook(
      (value: string) =>
        useAutosave({
          value,
          baseline: '## Hello',
          updatedAt: '2026-01-01T00:00:00.000Z',
          enabled: true,
          storageKey: 'editor:test:en',
          save,
        }),
      { initialProps: '## Hello' },
    );
    rerender('## Changed');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(result.current.status).toBe('conflict');
  });

  it('does not save when disabled (read-only)', async () => {
    const save = vi.fn();
    const { rerender } = renderHook(
      (value: string) =>
        useAutosave({
          value,
          baseline: '## Hello',
          updatedAt: '2026-01-01T00:00:00.000Z',
          enabled: false,
          storageKey: 'editor:test:en',
          save,
        }),
      { initialProps: '## Hello' },
    );
    rerender('## Changed');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(save).not.toHaveBeenCalled();
  });
});
