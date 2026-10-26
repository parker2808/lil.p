import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Prose } from './Prose';

describe('Prose', () => {
  it('uses the reading measure and compact variant', () => {
    const { container, rerender } = render(
      <Prose>
        <p>Body</p>
      </Prose>,
    );
    const prose = container.querySelector('[data-slot="prose"]');
    expect(prose).toHaveClass('max-w-measure', 'text-prose');
    expect(prose).not.toHaveAttribute('data-compact');

    rerender(
      <Prose compact>
        <p>Body</p>
      </Prose>,
    );
    expect(container.querySelector('[data-slot="prose"]')).toHaveAttribute('data-compact', 'true');
  });
});
