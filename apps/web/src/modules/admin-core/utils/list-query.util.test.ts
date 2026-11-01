import { adminPostListParamsSchema, adminProjectListParamsSchema } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { paramsFromSearch, searchFromParams } from './list-query.util';

describe('list query URL sync', () => {
  it('reads status and search filters from the URL', () => {
    const params = paramsFromSearch(
      adminProjectListParamsSchema,
      new URLSearchParams('status=DRAFT&q=case&page=3'),
    );
    expect(params).toMatchObject({ status: 'DRAFT', q: 'case', page: 3, pageSize: 20 });
  });

  it('writes filters back so a reload parses the same filters', () => {
    const params = adminProjectListParamsSchema.parse({
      status: 'DRAFT',
      q: 'case',
      domain: 'ops',
    });
    const search = searchFromParams(params);
    expect(new URLSearchParams(search).get('status')).toBe('DRAFT');
    expect(new URLSearchParams(search).get('q')).toBe('case');
    expect(paramsFromSearch(adminProjectListParamsSchema, new URLSearchParams(search))).toEqual(
      params,
    );
  });

  it('drops removed chips, empty search and default paging from the URL', () => {
    const params = adminPostListParamsSchema.parse({ q: '', status: undefined, page: 1 });
    const search = new URLSearchParams(searchFromParams(params));
    expect(search.has('q')).toBe(false);
    expect(search.has('status')).toBe(false);
    expect(search.has('page')).toBe(false);
    expect(search.has('pageSize')).toBe(false);
  });

  it('drops an invalid URL value and keeps the valid filters', () => {
    const params = paramsFromSearch(
      adminPostListParamsSchema,
      new URLSearchParams('status=NOPE&page=0&q=notes'),
    );
    expect(params).toMatchObject({ q: 'notes', page: 1 });
    expect(params.status).toBeUndefined();
  });

  it('keeps the parent view tab and ignores unknown params', () => {
    const current = new URLSearchParams('tab=posts&utm=x');
    const params = adminPostListParamsSchema.parse({ status: 'PUBLISHED' });
    const search = new URLSearchParams(searchFromParams(params, current));
    expect(search.get('tab')).toBe('posts');
    expect(search.get('status')).toBe('PUBLISHED');
    expect(search.has('utm')).toBe(false);
  });
});
