import { render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { ProjectsGrid } from './ProjectsGrid';

const renderLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => createElement('a', { href, className }, children);

describe('ProjectsGrid', () => {
  it('shows empty + clear filters when a filter matches nothing', () => {
    render(
      <ProjectsGrid
        items={[]}
        featured={null}
        page={1}
        pageSize={6}
        total={0}
        skill="svelte"
        emptyMessage="No case studies for Svelte"
        labels={{
          nda: 'NDA',
          clearFilters: 'Clear filters',
          previous: 'Previous',
          next: 'Next',
          pagination: 'Projects pages',
        }}
        renderLink={renderLink}
      />,
    );
    expect(screen.getByText('No case studies for Svelte')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear filters' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });
});
