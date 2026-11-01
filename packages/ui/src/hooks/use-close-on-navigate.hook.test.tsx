import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCloseOnNavigate } from './use-close-on-navigate.hook';

describe('useCloseOnNavigate', () => {
  it('starts closed and reports controlled open changes', () => {
    const { result } = renderHook(() => useCloseOnNavigate('/en'));
    expect(result.current.open).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);
  });

  it('stays open while the pathname is unchanged', () => {
    const { result, rerender } = renderHook(({ path }) => useCloseOnNavigate(path), {
      initialProps: { path: '/en' },
    });
    act(() => result.current.onOpenChange(true));

    rerender({ path: '/en' });
    expect(result.current.open).toBe(true);
  });

  it('closes when the pathname changes', () => {
    const { result, rerender } = renderHook(({ path }) => useCloseOnNavigate(path), {
      initialProps: { path: '/en' },
    });
    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);

    rerender({ path: '/en/about' });
    expect(result.current.open).toBe(false);
  });

  it('re-opens and closes again on the next path change', () => {
    const { result, rerender } = renderHook(({ path }) => useCloseOnNavigate(path), {
      initialProps: { path: '/en/about' },
    });
    act(() => result.current.onOpenChange(true));
    rerender({ path: '/en/projects' });
    expect(result.current.open).toBe(false);

    act(() => result.current.onOpenChange(true));
    expect(result.current.open).toBe(true);

    rerender({ path: '/en/notes' });
    expect(result.current.open).toBe(false);
  });
});
