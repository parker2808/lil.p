import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DiffStat } from './DiffStat';

describe('DiffStat', () => {
  it('renders a before → after gutter', () => {
    render(<DiffStat before="yes" after="no" label="Release freeze" />);
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.getByText('no')).toBeInTheDocument();
    expect(screen.getByText('Release freeze')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });
});
