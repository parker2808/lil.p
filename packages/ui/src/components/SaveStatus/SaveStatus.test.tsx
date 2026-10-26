import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SaveStatus } from './SaveStatus';

const labels = {
  saving: 'Saving',
  saved: 'Saved 12s ago',
  offline: 'Offline, changes kept locally',
  conflict: 'Conflict: newer version',
  loadLatest: 'Load latest',
  overwrite: 'Overwrite',
};

describe('SaveStatus', () => {
  it('shows conflict actions', () => {
    render(<SaveStatus state="conflict" labels={labels} />);
    expect(screen.getByRole('button', { name: labels.loadLatest })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.overwrite })).toBeInTheDocument();
  });
});
