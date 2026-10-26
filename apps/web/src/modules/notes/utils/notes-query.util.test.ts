import { postFixtures } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { groupPostsByYear, notesHref, parseNotesSearch } from './notes-query.util';

describe('parseNotesSearch', () => {
  it('reads q, tag and page', () => {
    expect(parseNotesSearch({ q: 'nuxt', tag: 'react', page: '2' })).toEqual({
      q: 'nuxt',
      tag: 'react',
      page: 2,
    });
  });
});

describe('notesHref', () => {
  it('omits empty filters and page 1', () => {
    expect(notesHref({ page: 1 })).toBe('/notes');
    expect(notesHref({ q: 'nuxt', tag: 'react', page: 2 })).toBe('/notes?q=nuxt&tag=react&page=2');
  });
});

describe('groupPostsByYear', () => {
  it('groups by UTC year', () => {
    const groups = groupPostsByYear(postFixtures);
    expect(groups[0]?.year).toBe('2026');
    expect(groups[0]?.posts).toHaveLength(2);
  });
});
