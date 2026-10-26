import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Callout } from './Callout';

describe('Callout', () => {
  it('marks the warning kind', () => {
    render(
      <Callout kind="WARNING" title="Warning">
        <p>Careful</p>
      </Callout>,
    );
    expect(screen.getByRole('complementary')).toHaveAttribute('data-kind', 'WARNING');
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
