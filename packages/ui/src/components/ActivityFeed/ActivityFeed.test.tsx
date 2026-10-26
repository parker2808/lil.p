import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ActivityFeed } from './ActivityFeed';

describe('ActivityFeed', () => {
  it('renders the empty state when there are no children', () => {
    render(<ActivityFeed empty={<p>No activity yet.</p>} />);
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
  });

  it('lists rows when children are present', () => {
    render(
      <ActivityFeed empty={<p>No activity yet.</p>}>
        <li>Created project</li>
      </ActivityFeed>,
    );
    expect(screen.getByText('Created project')).toBeInTheDocument();
  });
});
