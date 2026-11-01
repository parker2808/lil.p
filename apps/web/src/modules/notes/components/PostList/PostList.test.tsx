import { defaultRenderLink } from '@portfolio/ui/utils/render-link.util';
import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { PostList } from './PostList';

const labels = {
  minutes: 'min',
  clear: 'Clear',
  emptyTitle: 'No notes yet',
  emptyCta: 'Read case studies',
  previous: 'Previous',
  next: 'Next',
  pagination: 'Notes pages',
  results: '{count} notes',
};

function renderEmpty(props: Partial<ComponentProps<typeof PostList>> = {}) {
  render(
    <PostList
      page={{ items: [], page: 1, pageSize: 10, total: 0 }}
      featured={null}
      locale="en"
      emptyMessage="Nothing here yet"
      labels={labels}
      renderLink={defaultRenderLink}
      {...props}
    />,
  );
}

afterEach(cleanup);

describe('PostList empty state', () => {
  it('links to case studies when no notes are published', () => {
    renderEmpty();

    expect(screen.getByText('No notes yet')).toBeInTheDocument();
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read case studies' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  it('offers to clear the filters when a search has no results', () => {
    renderEmpty({ q: 'nuxt', emptyMessage: 'No results for nuxt' });

    expect(screen.getByText('No results for nuxt')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear' })).toHaveAttribute('href', '/notes');
    expect(screen.queryByRole('link', { name: 'Read case studies' })).not.toBeInTheDocument();
  });
});
