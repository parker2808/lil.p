import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionNav } from './SectionNav';

describe('SectionNav', () => {
  it('uses details on small screens and marks the current section', () => {
    document.body.innerHTML = '<h2 id="one">One</h2><h3 id="two">Two</h3>';
    render(
      <SectionNav
        label="On this page"
        items={[
          { id: 'one', title: 'One', depth: 2 },
          { id: 'two', title: 'Two', depth: 3 },
        ]}
      />,
    );

    expect(document.querySelector('details')).not.toBeNull();
    expect(
      screen.getAllByRole('link').some((link) => link.getAttribute('aria-current') === 'true'),
    ).toBe(true);
  });
});
