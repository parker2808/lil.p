import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SectionBoundary } from './SectionBoundary';

const LABELS = { error: 'Failed', retry: 'Retry', empty: 'Empty' };

describe('SectionBoundary', () => {
  it('renders the empty label', () => {
    render(
      <SectionBoundary labels={LABELS} fallback={null} isEmpty>
        hidden
      </SectionBoundary>,
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('hides when empty and hideWhenEmpty is set', () => {
    const { container } = render(
      <SectionBoundary labels={LABELS} fallback={null} isEmpty hideWhenEmpty>
        hidden
      </SectionBoundary>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the error state with a request id', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Boom(): null {
      throw new Error('boom');
    }
    render(
      <SectionBoundary labels={LABELS} fallback={null} requestId="req-9">
        <Boom />
      </SectionBoundary>,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('req-9')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
