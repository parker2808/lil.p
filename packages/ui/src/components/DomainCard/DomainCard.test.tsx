import { domainFixture, emptyDomainFixture } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DomainCard } from './DomainCard';

describe('DomainCard', () => {
  it('has a single title link and hides empty domains', () => {
    const { rerender, container } = render(
      <DomainCard
        domain={domainFixture}
        href="/projects?domain=sample-domain"
        labels={{ projects: 'projects' }}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/projects?domain=sample-domain');

    rerender(
      <DomainCard
        domain={emptyDomainFixture}
        href="/projects?domain=empty-domain"
        labels={{ projects: 'projects' }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
