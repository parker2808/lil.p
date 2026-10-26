import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContentProgress } from './ContentProgress';

function mockMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('ContentProgress', () => {
  it('hides under reduced motion', () => {
    mockMatchMedia(true);
    const { container } = render(<ContentProgress />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a progress bar otherwise', () => {
    mockMatchMedia(false);
    const { container } = render(<ContentProgress />);
    expect(container.querySelector('[data-slot="content-progress"]')).toHaveAttribute(
      'aria-hidden',
    );
  });
});
