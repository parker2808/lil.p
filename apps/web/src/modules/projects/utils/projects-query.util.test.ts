import { describe, expect, it } from 'vitest';

import { parseProjectsSearch, projectsHref } from './projects-query.util';

describe('parseProjectsSearch', () => {
  it('reads domain, skill and page from the query', () => {
    expect(parseProjectsSearch({ domain: 'fintech', skill: 'nuxt', page: '2' })).toEqual({
      domain: 'fintech',
      skill: 'nuxt',
      page: 2,
    });
  });

  it('drops invalid page values', () => {
    expect(parseProjectsSearch({ page: 'nope' })).toEqual({ page: 1 });
  });
});

describe('projectsHref', () => {
  it('omits the first page and empty filters', () => {
    expect(projectsHref({ page: 1 })).toBe('/projects');
    expect(projectsHref({ domain: 'fintech', skill: 'nuxt', page: 2 })).toBe(
      '/projects?domain=fintech&skill=nuxt&page=2',
    );
  });
});
