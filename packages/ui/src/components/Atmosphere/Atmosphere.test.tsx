import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Atmosphere } from './Atmosphere';

describe('Atmosphere', () => {
  it('renders nothing when disabled', () => {
    const { container } = render(<Atmosphere variant="hero" enabled={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is aria-hidden when enabled', () => {
    const { container } = render(<Atmosphere variant="hero" enabled />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
