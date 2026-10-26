import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FactChips } from './FactChips';

describe('FactChips', () => {
  it('hides when empty and lists chips otherwise', () => {
    const { container, rerender } = render(<FactChips chips={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<FactChips chips={['Stack A → Stack B']} />);
    expect(screen.getByText('Stack A → Stack B')).toBeInTheDocument();
  });
});
