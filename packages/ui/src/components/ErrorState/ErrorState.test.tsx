import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PageHeaderLinkProps } from '../PageHeader/PageHeader';
import { ErrorState } from './ErrorState';

afterEach(cleanup);

describe('ErrorState', () => {
  it('announces the message and retries on click', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Could not load" retryLabel="Retry" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a back link to the parent list next to retry', () => {
    render(
      <ErrorState
        message="This project could not be loaded."
        retryLabel="Retry"
        onRetry={() => undefined}
        back={{ href: '/admin/projects', label: 'Projects', ariaLabel: 'Back to Projects' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Back to Projects' });
    expect(link).toHaveAttribute('href', '/admin/projects');
    expect(link).toHaveTextContent('Projects');
  });

  it('renders the back link through the provided link component', () => {
    function TestLink({ children, ...props }: PageHeaderLinkProps) {
      return (
        <a data-test-link="" {...props}>
          {children}
        </a>
      );
    }

    render(
      <ErrorState
        message="Inbox could not be loaded."
        retryLabel="Retry"
        back={{ href: '/admin/inbox', label: 'Inbox' }}
        linkComponent={TestLink}
      />,
    );

    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('data-test-link');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the request id when given', () => {
    render(<ErrorState message="Failed" requestId="req-123" retryLabel="Retry" />);

    expect(screen.getByText('req-123')).toBeInTheDocument();
  });
});
