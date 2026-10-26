import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('shows the value and a text delta with an arrow, not color only', () => {
    render(
      <StatCard
        label="Published"
        value={2}
        delta={{ direction: 'up', text: '+2 vs previous 30d' }}
      />,
    );
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('+2 vs previous 30d')).toBeInTheDocument();
  });

  it('renders a down delta without relying on color', () => {
    render(
      <StatCard
        label="Drafts"
        value={1}
        delta={{ direction: 'down', text: '−1 vs previous 7d' }}
      />,
    );
    expect(screen.getByText('−1 vs previous 7d')).toBeInTheDocument();
  });
});
