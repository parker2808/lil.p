import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SegmentedControl, SegmentedControlItem } from './segmented-control';

describe('SegmentedControl', () => {
  it('fits its items by default and keeps their pointer cursor', () => {
    render(
      <SegmentedControl>
        <SegmentedControlItem>VI</SegmentedControlItem>
        <SegmentedControlItem>EN</SegmentedControlItem>
      </SegmentedControl>,
    );

    const control = screen.getByText('VI').parentElement;
    expect(control).toHaveClass('w-fit', 'self-start', 'inline-flex');
    expect(control).not.toHaveClass('grid');
    expect(screen.getByRole('button', { name: 'VI' })).toHaveClass('cursor-pointer');
  });

  it('uses equal grid columns for a small set of options', () => {
    render(
      <SegmentedControl variant="equal">
        <SegmentedControlItem>7 days</SegmentedControlItem>
        <SegmentedControlItem>30 days</SegmentedControlItem>
        <SegmentedControlItem>90 days</SegmentedControlItem>
      </SegmentedControl>,
    );

    expect(screen.getByText('7 days').parentElement).toHaveClass(
      'w-fit',
      'self-start',
      'grid',
      'grid-flow-col',
      'auto-cols-fr',
    );
  });
});
