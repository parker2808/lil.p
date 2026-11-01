import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SaveStatus } from './SaveStatus';

const labels = {
  saving: 'Saving',
  saved: 'Saved',
  offline: 'Offline, changes kept locally',
  conflict: 'Conflict: newer version',
  loadLatest: 'Load latest',
  overwrite: 'Overwrite',
};

describe('SaveStatus', () => {
  it('renders nothing when idle', () => {
    const { container } = render(<SaveStatus state="idle" labels={labels} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the saved time when provided', () => {
    render(<SaveStatus state="saved" savedText="Saved 10:42" labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved 10:42');
  });

  it('falls back to the saved label without a time', () => {
    render(<SaveStatus state="saved" labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent(labels.saved);
  });

  it('marks saving as busy', () => {
    render(<SaveStatus state="saving" labels={labels} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(labels.saving);
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the offline error', () => {
    render(<SaveStatus state="offline" labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent(labels.offline);
  });

  it('shows conflict actions', () => {
    render(<SaveStatus state="conflict" labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent(labels.conflict);
    expect(screen.getByRole('button', { name: labels.loadLatest })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.overwrite })).toBeInTheDocument();
  });
});
