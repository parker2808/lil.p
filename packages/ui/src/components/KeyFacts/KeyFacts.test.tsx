import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KeyFacts } from './KeyFacts';

describe('KeyFacts', () => {
  it('hides when there are fewer than two facts', () => {
    const { container, rerender } = render(<KeyFacts facts={['Only one']} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<KeyFacts facts={['First fact', 'Second fact']} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
