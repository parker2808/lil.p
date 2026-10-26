import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from './Icon';

describe('Icon', () => {
  it('renders nothing for an unknown key', () => {
    const { container } = render(<Icon name="not-a-real-icon" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a known icon', () => {
    const { container } = render(<Icon name="sparkles" />);
    expect(container.querySelector('[data-icon="sparkles"]')).not.toBeNull();
  });
});
