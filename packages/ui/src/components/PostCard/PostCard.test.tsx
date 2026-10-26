import { postFixture, viPostFixture } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PostCard } from './PostCard';

describe('PostCard', () => {
  it('has a single title link and an EN badge on English posts', () => {
    render(
      <PostCard
        post={postFixture}
        href="/notes/sample-note"
        dateLabel="Oct 12"
        labels={{ minutes: 'min' }}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent(postFixture.title);
    expect(screen.getByRole('article')).toHaveAttribute('data-lang', 'en');
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('omits the EN badge on Vietnamese posts', () => {
    render(
      <PostCard
        post={viPostFixture}
        href="/notes/sample-note-vi"
        dateLabel="12 thg 10"
        labels={{ minutes: 'min' }}
      />,
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-lang', 'vi');
    expect(screen.queryByText('EN')).not.toBeInTheDocument();
  });
});
