import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavLink } from './NavLink';

describe('NavLink', () => {
  it('sets aria-current on the active item', () => {
    render(
      <nav>
        <NavLink href="/work" active>
          Work
        </NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>,
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });
});
