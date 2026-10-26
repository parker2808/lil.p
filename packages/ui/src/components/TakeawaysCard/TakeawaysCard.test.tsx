import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TakeawaysCard } from './TakeawaysCard';

describe('TakeawaysCard', () => {
  it('hides when empty', () => {
    const { container } = render(<TakeawaysCard title="Key takeaways" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists each takeaway', () => {
    render(<TakeawaysCard title="Key takeaways" items={['Replace state']} />);
    expect(screen.getByRole('complementary')).toHaveClass('bg-primary-subtle');
    expect(screen.getByText('Replace state')).toBeInTheDocument();
  });
});
