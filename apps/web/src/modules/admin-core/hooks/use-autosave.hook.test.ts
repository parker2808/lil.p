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

  it('reports saved with the record time on load', () => {
    const { result } = renderHook(() =>
      useAutosave({
        value: '## Hello',
        baseline: '## Hello',
        updatedAt: '2026-01-01T10:42:00.000Z',
        enabled: true,
        storageKey: 'editor:test:en',
        save: vi.fn(),
      }),
    );
    expect(result.current.status).toBe('saved');
    expect(result.current.savedAt).toBe('2026-01-01T10:42:00.000Z');
  });

  it('stays idle on load when the record was never saved', () => {
    const { result } = renderHook(() =>
      useAutosave({
        value: '',
        baseline: '',
        updatedAt: null,
        enabled: true,
        storageKey: 'editor:test:en',
        save: vi.fn(),
      }),
    );
    expect(result.current.status).toBe('idle');
    expect(result.current.savedAt).toBeNull();
  });

  it('moves through dirty and saving to saved with the new time', async () => {
    let resolveSave: (value: { updatedAt: string }) => void = () => undefined;
    const save = vi.fn(
      () =>
        new Promise<{ updatedAt: string }>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const { result, rerender } = renderHook(
      ({ value, baseline }: { value: string; baseline: string }) =>
        useAutosave({
          value,
          baseline,
          updatedAt: '2026-01-01T10:42:00.000Z',
          enabled: true,
          storageKey: 'editor:test:en',
          save,
        }),
      { initialProps: { value: '## Hello', baseline: '## Hello' } },
    );

    rerender({ value: '## Changed', baseline: '## Hello' });
    expect(result.current.status).toBe('dirty');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(result.current.status).toBe('saving');

    await act(async () => {
      resolveSave({ updatedAt: '2026-01-01T10:45:00.000Z' });
    });
    rerender({ value: '## Changed', baseline: '## Changed' });
    expect(result.current.status).toBe('saved');
    expect(result.current.savedAt).toBe('2026-01-01T10:45:00.000Z');
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
