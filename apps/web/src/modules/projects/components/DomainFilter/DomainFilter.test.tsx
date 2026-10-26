import { domainFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DomainFilter } from './DomainFilter';

describe('DomainFilter', () => {
  it('renders All and domain links that work without JavaScript', () => {
    render(<DomainFilter domains={domainFixtures} skill="nuxt" labels={{ all: 'All' }} />);
    expect(screen.getByRole('link', { name: /All/ })).toHaveAttribute(
      'href',
      '/projects?skill=nuxt',
    );
    expect(screen.getByRole('link', { name: /Sample domain/ })).toHaveAttribute(
      'href',
      '/projects?domain=sample-domain&skill=nuxt',
    );
  });
});
