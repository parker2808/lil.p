import { adminProjectListParamsSchema } from '@portfolio/contracts';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/admin/projects',
  useSearchParams: () => new URLSearchParams('q=case&page=2&status=DRAFT'),
}));

import { useListParams } from './use-list-params.hook';

describe('useListParams', () => {
  it('parses the URL and writes search, sort and page back into it', () => {
    const { result } = renderHook(() => useListParams(adminProjectListParamsSchema));
    expect(result.current.params).toMatchObject({ q: 'case', page: 2, status: 'DRAFT' });

    act(() => {
      result.current.setParams({ sort: '-updatedAt', page: 1, q: 'ops' });
    });

    expect(replace).toHaveBeenCalledWith('/admin/projects?sort=-updatedAt&q=ops&status=DRAFT');
  });

  it('pushes a history entry instead of replacing when asked', () => {
    replace.mockClear();
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    const { result } = renderHook(() => useListParams(adminProjectListParamsSchema));

    act(() => {
      result.current.setParams({ q: 'ops' }, { history: 'push' });
    });

    expect(pushState).toHaveBeenCalledWith(
      null,
      '',
      '/admin/projects?page=2&sort=sortOrder&q=ops&status=DRAFT',
    );
    expect(replace).not.toHaveBeenCalled();
    pushState.mockRestore();
  });

  it('does not push a duplicate entry when the URL is unchanged', () => {
    window.history.replaceState(
      null,
      '',
      '/admin/projects?page=2&sort=sortOrder&q=ops&status=DRAFT',
    );
    const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    const { result } = renderHook(() => useListParams(adminProjectListParamsSchema));

    act(() => {
      result.current.setParams({ q: 'ops' }, { history: 'push' });
    });

    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });
});
