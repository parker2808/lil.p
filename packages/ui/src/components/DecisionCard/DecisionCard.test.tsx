import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DecisionCard } from './DecisionCard';

describe('DecisionCard', () => {
  it('renders the title and compact body', () => {
    render(
      <DecisionCard title="Axios to TanStack Query">
        <p>Cache and retries.</p>
      </DecisionCard>,
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-slot', 'decision-card');
    expect(screen.getByText('Axios to TanStack Query')).toBeInTheDocument();
    expect(screen.getByText('Cache and retries.')).toBeInTheDocument();
  });
});
