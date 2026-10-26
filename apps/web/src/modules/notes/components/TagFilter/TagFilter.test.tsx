import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TagFilter } from './TagFilter';

describe('TagFilter', () => {
  it('renders tag links that keep the search query', () => {
    render(
      <TagFilter
        tags={[{ id: 1, slug: 'react', name: 'React', postCount: 2, lang: 'en' }]}
        q="nuxt"
        labels={{ all: 'All' }}
      />,
    );
    expect(screen.getByRole('link', { name: /All/ })).toHaveAttribute('href', '/notes?q=nuxt');
    expect(screen.getByRole('link', { name: /React/ })).toHaveAttribute(
      'href',
      '/notes?q=nuxt&tag=react',
    );
  });
});
