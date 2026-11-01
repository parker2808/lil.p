import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader, type PageHeaderLinkProps } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as the page heading with actions', () => {
    render(<PageHeader title="Case study" actions={<button type="button">Publish</button>} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Case study' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a mobile-only back link to the parent', () => {
    render(
      <PageHeader
        title="Case study"
        back={{ href: '/admin/projects', label: 'Projects', ariaLabel: 'Back to Projects' }}
      />,
    );

    const link = screen.getByRole('link', { name: 'Back to Projects' });
    expect(link).toHaveAttribute('href', '/admin/projects');
    expect(link).toHaveTextContent('Projects');
    expect(link.querySelector('[data-slot="page-header-back-icon"]')).toBeInTheDocument();
    expect(link).toHaveClass('sm:hidden');
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
      <PageHeader
        title="Message"
        back={{ href: '/admin/inbox', label: 'Inbox' }}
        linkComponent={TestLink}
      />,
    );

    const link = screen.getByRole('link', { name: 'Inbox' });
    expect(link).toHaveAttribute('data-test-link');
    expect(link).toHaveAttribute('href', '/admin/inbox');
  });
});
