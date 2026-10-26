import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequirementColumns } from './RequirementColumns';

describe('RequirementColumns', () => {
  it('hides when empty and renders column titles', () => {
    const { container, rerender } = render(<RequirementColumns columns={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(
      <RequirementColumns
        columns={[
          { title: 'Functional', items: ['Keep the contract'] },
          { title: 'Non-functional', items: ['Stay small'] },
        ]}
      />,
    );
    expect(screen.getByText('Functional')).toBeInTheDocument();
    expect(screen.getByText('Keep the contract')).toBeInTheDocument();
  });
});
