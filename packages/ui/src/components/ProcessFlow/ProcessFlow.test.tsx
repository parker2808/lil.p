import { processStepFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProcessFlow } from './ProcessFlow';

describe('ProcessFlow', () => {
  it('hides when there are fewer than three steps', () => {
    const { container } = render(<ProcessFlow steps={processStepFixtures.slice(0, 2)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('highlights the middle step', () => {
    render(<ProcessFlow steps={processStepFixtures} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(document.querySelector('[data-active]')).toHaveTextContent('Strangler routes');
  });
});
