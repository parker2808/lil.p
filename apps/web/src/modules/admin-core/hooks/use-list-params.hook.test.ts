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
});
