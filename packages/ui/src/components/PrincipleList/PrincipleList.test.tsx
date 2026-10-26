import { principleFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PrincipleList } from './PrincipleList';

describe('PrincipleList', () => {
  it('hides when empty and numbers the rows', () => {
    const { container, rerender } = render(<PrincipleList principles={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<PrincipleList principles={principleFixtures} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
